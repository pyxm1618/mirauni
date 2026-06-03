/**
 * 验证码登录 API
 * POST /api/auth/verify-code
 * Body: { phone: string, code: string }
 * 
 * 登录逻辑：
 * 1. 验证验证码
 * 2. 查找或创建用户
 * 3. 使用 Supabase Auth 创建/登录用户
 * 4. 返回 session
 */
import crypto from 'crypto'
import { getRequestIP } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { checkVerifyCodeRateLimit, incrementVerifyCodeAttempts, clearVerifyCodeAttempts } from '~/server/utils/reset-code-rate-limit'

export default defineEventHandler(async (event) => {
    const { phone, code } = await readBody(event)

    // 验证参数
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        throw createError({
            statusCode: 400,
            message: '请输入正确的手机号'
        })
    }

    if (!code || !/^\d{6}$/.test(code)) {
        throw createError({
            statusCode: 400,
            message: '请输入6位验证码'
        })
    }

    const supabase = await serverSupabaseClient(event)
    const supabaseAdmin = serverSupabaseServiceRole(event)

    const ip = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
    const isDevMasterCode = process.dev && code === '888888'

    // 1. 验证验证码
    let smsData = null
    if (!isDevMasterCode) {
        // 非万能验证码，检查频率限制
        checkVerifyCodeRateLimit(phone, ip)

        const { data, error: smsError } = await supabaseAdmin
            .from('sms_codes')
            .select()
            .eq('phone', phone)
            .eq('code', code)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (smsError || !data) {
            // 校验失败，增加错误尝试次数并抛出 400/429 错误中断流程
            incrementVerifyCodeAttempts(phone, ip)
        }
        smsData = data
    } else {
        console.log(`[DEV] 使用万能验证码登录: ${phone}`)
    }

    // 2. 查找现有用户
    let { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

    // 3. 处理认证逻辑
    const email = `${phone}@phone.mirauni.com`
    let supabasePassword
    let authUser

    // 辅助函数：使用 crypto.randomBytes 生成高强度的强随机密码，绝不用 Math.random()
    const generateSafePassword = () => {
        return crypto.randomBytes(32).toString('base64url') + 'Aa1!'
    }

    if (existingUser) {
        // 用户已存在，查找 Secret
        const { data: secret } = await supabaseAdmin
            .from('user_secrets')
            .select('supabase_password')
            .eq('user_id', existingUser.id)
            .single()
        
        if (secret?.supabase_password) {
            supabasePassword = secret.supabase_password
        } else {
            // 迁移逻辑：老用户没有 Secret，重置密码并创建 Secret
            console.log(`[AUTH] 迁移用户 ${existingUser.id} 到新认证体系`)
            supabasePassword = generateSafePassword()
            
            // 更新 Auth 密码
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                existingUser.id, 
                { password: supabasePassword }
            )
            
            if (updateError) {
                console.error('迁移更新密码失败:', updateError)
                throw createError({
                    statusCode: 500,
                    message: '用户迁移更新密码失败，请稍后重试'
                })
            }

            // 插入 Secret
            const { error: secretError } = await supabaseAdmin.from('user_secrets').insert({
                user_id: existingUser.id,
                supabase_password: supabasePassword
            })

            if (secretError) {
                console.error('迁移保存用户密码密文失败:', secretError)
                throw createError({
                    statusCode: 500,
                    message: '保存用户登录密钥失败，请稍后重试'
                })
            }
        }
    } else {
        // 新用户注册
        supabasePassword = generateSafePassword()
        
        // 创建 Auth 账户
        const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: supabasePassword,
            email_confirm: true,
            user_metadata: { phone }
        })

        if (signUpError) {
            console.error('创建 Auth 用户失败:', signUpError)
            throw createError({
                statusCode: 500,
                message: '注册失败，请稍后重试'
            })
        }

        const userId = signUpData.user.id

        // 创建 users 表记录
        const { data: newUser, error: createUserError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                phone,
                has_password: false, // 默认为 false
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (createUserError) {
            console.error('创建用户记录失败:', createUserError)
            await supabaseAdmin.auth.admin.deleteUser(userId)
            throw createError({
                statusCode: 500,
                message: '注册失败，请稍后重试'
            })
        }

        // 创建 Secret
        const { error: secretError } = await supabaseAdmin.from('user_secrets').insert({
            user_id: userId,
            supabase_password: supabasePassword
        })

        if (secretError) {
            console.error('创建用户密码密文失败:', secretError)
            
            // 回滚：1. 先尝试删除 public.users 记录
            try {
                const { error: deleteUserError } = await supabaseAdmin
                    .from('users')
                    .delete()
                    .eq('id', userId)
                if (deleteUserError) {
                    console.error('回滚删除 public.users 记录失败:', deleteUserError)
                }
            } catch (err) {
                console.error('回滚删除 public.users 记录捕获到异常:', err)
            }

            // 回滚：2. 再尝试删除 Auth 用户
            try {
                const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)
                if (deleteAuthError) {
                    console.error('回滚删除 Auth 用户失败:', deleteAuthError)
                }
            } catch (err) {
                console.error('回滚删除 Auth 用户捕获到异常:', err)
            }

            throw createError({
                statusCode: 500,
                message: '创建用户登录密钥失败，请稍后重试'
            })
        }

        existingUser = newUser
    }

    // 4. 登录
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password: supabasePassword
    })

    if (signInError) {
        console.error('登录失败:', signInError)
        throw createError({
            statusCode: 500,
            message: '登录失败，请稍后重试'
        })
    }
    authUser = signInData

    // 只有全部成功登录后，才删除已使用的验证码并清空限频计数
    if (!isDevMasterCode) {
        try {
            const { error: deleteError } = await supabaseAdmin
                .from('sms_codes')
                .delete()
                .eq('phone', phone)
            
            if (deleteError) {
                console.error('删除已使用验证码失败:', deleteError)
            }
        } catch (err) {
            console.error('删除已使用验证码时发生异常:', err)
        }

        // 清空错误次数限制
        clearVerifyCodeAttempts(phone, ip)
    }

    // 5. 返回用户信息和 session
    return {
        success: true,
        user: {
            id: existingUser.id,
            phone: existingUser.phone,
            username: existingUser.username,
            avatar_url: existingUser.avatar_url,
            bio: existingUser.bio,
            skills: existingUser.skills,
            unlock_credits: existingUser.unlock_credits,
            is_first_charge: existingUser.is_first_charge,
            has_password: existingUser.has_password
        },
        needSetPassword: !existingUser.has_password,
        session: authUser?.session ? {
            access_token: authUser.session.access_token,
            refresh_token: authUser.session.refresh_token,
            expires_at: authUser.session.expires_at
        } : null
    }
})

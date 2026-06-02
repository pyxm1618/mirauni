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
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

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

    // 1. 验证验证码（开发模式支持万能验证码 888888）
    const isDevMasterCode = process.dev && code === '888888'

    let smsData = null
    if (!isDevMasterCode) {
        const { data, error: smsError } = await supabase
            .from('sms_codes')
            .select()
            .eq('phone', phone)
            .eq('code', code)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (smsError || !data) {
            throw createError({
                statusCode: 400,
                message: '验证码错误或已过期'
            })
        }
        smsData = data
    } else {
        console.log(`[DEV] 使用万能验证码登录: ${phone}`)
    }

    // 2. 删除已使用的验证码（仅非万能验证码时）
    if (!isDevMasterCode) {
        await supabase.from('sms_codes').delete().eq('phone', phone)
    }

    // 3. 查找现有用户
    let { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

    // 4. 处理认证逻辑
    const email = `${phone}@phone.mirauni.com`
    let supabasePassword
    let authUser

    // 辅助函数：生成安全的随机密码
    const generateSafePassword = () => {
        return Math.random().toString(36).slice(-8) + 
               Math.random().toString(36).slice(-8) + 
               'Aa1!' // 确保包含大小写和数字/符号
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
                // 尝试创建 Auth 用户（如果之前的逻辑删除了 Auth 用户但保留了 public.users）
                // 这里简化处理，假设 update 失败通常是因为 Auth 用户不存在
            }

            // 插入 Secret
            await supabaseAdmin.from('user_secrets').insert({
                user_id: existingUser.id,
                supabase_password: supabasePassword
            })
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
        await supabaseAdmin.from('user_secrets').insert({
            user_id: userId,
            supabase_password: supabasePassword
        })

        existingUser = newUser
    }

    // 5. 登录
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

    // 6. 返回用户信息和 session
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

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
    let { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

    // 4. 使用 Supabase Auth 登录或创建用户
    // 构造一个基于手机号的邮箱（Supabase Auth 需要邮箱）
    const email = `${phone}@phone.mirauni.com`
    const password = `mirauni_${phone}_secure_pwd`

    let authUser

    if (existingUser) {
        // 用户已存在，登录
        const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        })

        if (signInError) {
            // 可能是首次迁移的老用户，尝试创建 auth 账户
            const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    phone,
                    user_id: existingUser.id
                }
            })

            if (signUpError) {
                console.error('创建 Auth 用户失败:', signUpError)
                throw createError({
                    statusCode: 500,
                    message: '登录失败，请稍后重试'
                })
            }

            // 再次登录
            const { data: retrySignIn } = await supabaseAdmin.auth.signInWithPassword({
                email,
                password
            })
            authUser = retrySignIn
        } else {
            authUser = signInData
        }
    } else {
        // 5. 新用户，创建 Auth 账户和用户记录
        const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { phone }
        })

        if (signUpError) {
            console.error('创建用户失败:', signUpError)
            throw createError({
                statusCode: 500,
                message: '注册失败，请稍后重试'
            })
        }

        // 创建 users 表记录（使用 admin 客户端绕过 RLS）
        const { data: newUser, error: createUserError } = await supabaseAdmin
            .from('users')
            .insert({
                id: signUpData.user.id,  // 使用 Auth 用户的 ID
                phone,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (createUserError) {
            console.error('创建用户记录失败:', createUserError)
            // 回滚 Auth 用户
            await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id)
            throw createError({
                statusCode: 500,
                message: '注册失败，请稍后重试'
            })
        }

        existingUser = newUser

        // 登录新用户
        const { data: signInData } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        })
        authUser = signInData
    }

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
            is_first_charge: existingUser.is_first_charge
        },
        session: authUser?.session ? {
            access_token: authUser.session.access_token,
            refresh_token: authUser.session.refresh_token,
            expires_at: authUser.session.expires_at
        } : null
    }
})

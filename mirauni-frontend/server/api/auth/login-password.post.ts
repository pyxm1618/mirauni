/**
 * 密码登录 API
 * POST /api/auth/login-password
 * Body: { phone: string, password: string }
 */
import { serverSupabaseServiceRole } from '#supabase/server'
import { verifyPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
    const { phone, password } = await readBody(event)

    if (!phone || !password) {
        throw createError({
            statusCode: 400,
            message: '请输入手机号和密码'
        })
    }

    const supabaseAdmin = serverSupabaseServiceRole(event)

    // 1. 查找用户
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

    if (!user) {
        throw createError({
            statusCode: 400,
            message: '用户不存在或密码错误'
        })
    }

    // 2. 验证密码
    const { data: secret } = await supabaseAdmin
        .from('user_secrets')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!secret || !secret.password_hash) {
        throw createError({
            statusCode: 400,
            message: '未设置密码，请使用验证码登录'
        })
    }

    const isValid = await verifyPassword(password, secret.password_hash)
    if (!isValid) {
        throw createError({
            statusCode: 400,
            message: '用户不存在或密码错误'
        })
    }

    // 3. 登录 Supabase Auth
    const email = `${phone}@phone.mirauni.com`
    const supabasePassword = secret.supabase_password

    if (!supabasePassword) {
        throw createError({
            statusCode: 500,
            message: '系统错误：认证配置缺失'
        })
    }

    const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password: supabasePassword
    })

    if (loginError) {
        console.error('登录失败:', loginError)
        throw createError({
            statusCode: 500,
            message: '登录失败，请稍后重试'
        })
    }

    // 4. 返回结果
    return {
        success: true,
        user: {
            id: user.id,
            phone: user.phone,
            username: user.username,
            avatar_url: user.avatar_url,
            bio: user.bio,
            skills: user.skills,
            unlock_credits: user.unlock_credits,
            is_first_charge: user.is_first_charge,
            has_password: user.has_password
        },
        session: loginData.session ? {
            access_token: loginData.session.access_token,
            refresh_token: loginData.session.refresh_token,
            expires_at: loginData.session.expires_at
        } : null
    }
})

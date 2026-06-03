/**
 * 设置/修改密码 API
 * POST /api/auth/set-password
 * Body: { password: string }
 * 需要登录状态 (支持 Cookie 或 Authorization header)
 */
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { hashPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
    const { password } = await readBody(event)

    const supabaseAdmin = serverSupabaseServiceRole(event)

    // 1. 验证用户登录状态 - 优先使用 Cookie，其次使用 Authorization header
    let user: any = await serverSupabaseUser(event)

    if (!user) {
        // 尝试从 Authorization header 获取
        const authHeader = getHeader(event, 'authorization')
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7)
            const { data } = await supabaseAdmin.auth.getUser(token)
            user = data.user
        }
    }

    if (!user || !user.id || user.id === 'undefined') {
        throw createError({
            statusCode: 401,
            message: '未登录或登录失效'
        })
    }

    if (!password || password.length < 6) {
        throw createError({
            statusCode: 400,
            message: '密码长度至少为6位'
        })
    }

    // 2. 生成哈希
    const hashedPassword = await hashPassword(password)

    // 3. 更新 user_secrets
    const { data: secretData, error: secretError } = await supabaseAdmin
        .from('user_secrets')
        .update({ password_hash: hashedPassword })
        .eq('user_id', user.id)
        .select('user_id')

    if (secretError || !secretData || secretData.length === 0) {
        console.error('更新密码哈希失败或记录不存在:', secretError, secretData)
        throw createError({
            statusCode: 500,
            message: '设置密码失败，用户凭证不存在或不可更新'
        })
    }

    // 4. 更新 users.has_password
    const { error: userError } = await supabaseAdmin
        .from('users')
        .update({ has_password: true })
        .eq('id', user.id)

    if (userError) {
        console.error('更新用户状态失败:', userError)
        throw createError({
            statusCode: 500,
            message: '设置密码失败'
        })
    }

    return {
        success: true
    }
})

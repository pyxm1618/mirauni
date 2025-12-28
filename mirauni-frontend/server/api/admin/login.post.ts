/**
 * 管理员登录 API
 * POST /api/admin/login
 */
import { createAdminSupabaseClient, signAdminToken, verifyPassword } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    // 设置 CORS 响应头
    const origin = getHeader(event, 'origin') || ''
    const allowedOrigins = ['https://admin.mirauni.com', 'http://localhost:3001', 'http://localhost:5173']
    if (allowedOrigins.includes(origin)) {
        setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
    }
    setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')

    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
        throw createError({
            statusCode: 400,
            data: {
                code: 'VALIDATION_ERROR',
                message: '请输入用户名和密码'
            }
        })
    }

    const supabase = createAdminSupabaseClient()

    // 查询管理员账号
    const { data: admin, error } = await supabase
        .from('users')
        .select('id, username, admin_role, admin_password')
        .eq('username', username)
        .not('admin_role', 'is', null)
        .single()

    if (error || !admin) {
        throw createError({
            statusCode: 401,
            data: {
                code: 'UNAUTHORIZED',
                message: '账号不存在或无管理员权限'
            }
        })
    }

    // 验证密码
    // 如果没有设置 admin_password，则使用简单密码验证（仅用于初始化）
    let passwordValid = false
    if (admin.admin_password) {
        passwordValid = await verifyPassword(password, admin.admin_password)
    } else {
        // 初始化阶段，使用明文密码比对（建议后续更新为加密密码）
        // 这里假设初始密码为 admin123
        passwordValid = password === 'admin123'
    }

    if (!passwordValid) {
        throw createError({
            statusCode: 401,
            data: {
                code: 'UNAUTHORIZED',
                message: '密码错误'
            }
        })
    }

    // 生成 JWT
    const token = signAdminToken({
        userId: admin.id,
        role: admin.admin_role
    })

    return {
        success: true,
        data: {
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                admin_role: admin.admin_role
            }
        }
    }
})

/**
 * 管理员认证工具函数
 */
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { H3Event } from 'h3'

const JWT_SECRET = process.env.JWT_SECRET || 'mirauni-admin-secret-key-2025'

// 创建 Supabase 管理员客户端
export function createAdminSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
    return createClient(supabaseUrl, supabaseServiceKey)
}

// 生成管理员 JWT Token
export function signAdminToken(payload: { userId: string; role: string }) {
    return jwt.sign(
        {
            ...payload,
            isAdmin: true,
            iat: Math.floor(Date.now() / 1000)
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    )
}

// 验证管理员 JWT Token
export function verifyAdminToken(token: string) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string
            role: string
            isAdmin: boolean
        }
        if (!decoded.isAdmin) return null
        return decoded
    } catch {
        return null
    }
}

// 密码加密
export async function hashPassword(password: string) {
    return bcrypt.hash(password, 10)
}

// 密码验证
export async function verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash)
}

// 从请求中获取管理员信息
export async function getAdminFromEvent(event: H3Event) {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.slice(7)
    const decoded = verifyAdminToken(token)
    if (!decoded) return null

    const supabase = createAdminSupabaseClient()
    const { data: admin } = await supabase
        .from('users')
        .select('id, username, admin_role')
        .eq('id', decoded.userId)
        .not('admin_role', 'is', null)
        .single()

    return admin
}

// 要求管理员权限的中间件
export async function requireAdmin(event: H3Event, requiredRole?: string[]) {
    const admin = await getAdminFromEvent(event)

    if (!admin) {
        throw createError({
            statusCode: 401,
            data: {
                code: 'UNAUTHORIZED',
                message: '请先登录管理后台'
            }
        })
    }

    if (requiredRole && !requiredRole.includes(admin.admin_role)) {
        throw createError({
            statusCode: 403,
            data: {
                code: 'FORBIDDEN',
                message: '权限不足'
            }
        })
    }

    event.context.admin = admin
    return admin
}

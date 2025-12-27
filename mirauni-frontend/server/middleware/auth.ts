/**
 * 服务端认证中间件
 * 
 * 1. 验证 Supabase Session
 * 2. 注入 event.context.user
 */
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    // 忽略非 API 请求
    if (!event.path.startsWith('/api/')) {
        return
    }

    // 忽略公开 API
    const publicPaths = [
        '/api/auth/send-code',
        '/api/auth/verify-code',
        '/api/auth/wechat/url',
        '/api/auth/wechat/callback',
        '/api/auth/bind-phone',
        '/api/admin/login'
    ]

    if (publicPaths.some(path => event.path.startsWith(path))) {
        return
    }

    // 验证用户 session
    const user = await serverSupabaseUser(event)

    if (user) {
        event.context.user = user
        event.context.userId = user.id
    }
})

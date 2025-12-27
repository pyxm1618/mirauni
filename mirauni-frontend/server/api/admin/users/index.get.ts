/**
 * 用户列表 API
 * GET /api/admin/users
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const keyword = query.keyword as string

    const supabase = createAdminSupabaseClient()

    let request = supabase
        .from('users')
        .select('id, username, phone, avatar_url, bio, status, unlock_credits, admin_role, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })

    // 关键词搜索
    if (keyword) {
        request = request.or(`username.ilike.%${keyword}%,phone.ilike.%${keyword}%`)
    }

    // 分页
    const from = (page - 1) * pageSize
    request = request.range(from, from + pageSize - 1)

    const { data, count, error } = await request

    if (error) {
        throw createError({
            statusCode: 500,
            data: { code: 'DB_ERROR', message: error.message }
        })
    }

    return {
        success: true,
        data,
        meta: { total: count, page, pageSize }
    }
})

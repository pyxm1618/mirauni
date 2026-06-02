/**
 * 项目列表 API (管理后台)
 * GET /api/admin/projects
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const status = query.status as string
    const category = query.category as string

    const supabase = createAdminSupabaseClient()

    let request = supabase
        .from('projects')
        .select('*, users:user_id(username, avatar_url)', { count: 'exact' })
        .order('created_at', { ascending: false })

    // 状态筛选
    if (status) {
        request = request.eq('status', status)
    }

    // 分类筛选
    if (category) {
        request = request.eq('category', category)
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

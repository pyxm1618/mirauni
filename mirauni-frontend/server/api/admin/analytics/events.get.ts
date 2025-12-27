/**
 * 事件明细 API
 * GET /api/admin/analytics/events
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 50
    const eventName = query.eventName as string
    const userId = query.userId as string

    const supabase = createAdminSupabaseClient()

    let request = supabase
        .from('events')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

    // 事件类型筛选
    if (eventName) {
        request = request.eq('event_name', eventName)
    }

    // 用户ID筛选
    if (userId) {
        request = request.eq('user_id', userId)
    }

    // 分页
    const from = (page - 1) * pageSize
    request = request.range(from, from + pageSize - 1)

    const { data, count, error } = await request

    if (error) {
        // 如果 events 表不存在，返回空数据
        return {
            success: true,
            data: [],
            meta: { total: 0, page, pageSize }
        }
    }

    return {
        success: true,
        data,
        meta: { total: count, page, pageSize }
    }
})

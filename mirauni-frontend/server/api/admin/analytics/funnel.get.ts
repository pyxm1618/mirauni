/**
 * 转化漏斗 API
 * GET /api/admin/analytics/funnel
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const query = getQuery(event)
    const days = parseInt(query.days as string) || 7

    const supabase = createAdminSupabaseClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
        .from('events')
        .select('event_name, user_id')
        .gte('created_at', startDate.toISOString())

    if (error) {
        // 如果 events 表不存在，返回空数据
        return { success: true, data: [] }
    }

    const steps = [
        'page_view',
        'register',
        'project_view',
        'unlock_click',
        'recharge_success',
        'unlock_success'
    ]

    const funnel = steps.map(eventName => {
        const users = new Set(
            data
                ?.filter(e => e.event_name === eventName)
                .map(e => e.user_id || 'anonymous')
        )
        return {
            event: eventName,
            count: users.size
        }
    })

    // 计算百分比和转化率
    const firstCount = funnel[0]?.count || 1
    const result = funnel.map((step, i) => ({
        ...step,
        percentage: firstCount > 0 ? ((step.count / firstCount) * 100).toFixed(2) : '0',
        conversionToNext: i < funnel.length - 1 && step.count > 0
            ? ((funnel[i + 1].count / step.count) * 100).toFixed(2)
            : null
    }))

    return { success: true, data: result }
})

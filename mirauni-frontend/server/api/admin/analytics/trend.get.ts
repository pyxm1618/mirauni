/**
 * 趋势数据 API
 * GET /api/admin/analytics/trend
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const query = getQuery(event)
    const range = parseInt(query.range as string) || 7

    const supabase = createAdminSupabaseClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - range)

    const { data, error } = await supabase
        .from('events')
        .select('event_name, created_at')
        .gte('created_at', startDate.toISOString())
        .in('event_name', ['register', 'recharge_success', 'unlock_success'])

    if (error) {
        // 如果 events 表不存在，返回空数据
        return { success: true, data: [] }
    }

    // 按日期分组
    const grouped: Record<string, { register: number; recharge: number; unlock: number }> = {}

    data?.forEach(item => {
        const date = item.created_at.split('T')[0]
        if (!grouped[date]) {
            grouped[date] = { register: 0, recharge: 0, unlock: 0 }
        }
        if (item.event_name === 'register') grouped[date].register++
        if (item.event_name === 'recharge_success') grouped[date].recharge++
        if (item.event_name === 'unlock_success') grouped[date].unlock++
    })

    // 填充缺失日期
    const result = []
    for (let i = range - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        result.push({
            date: dateStr,
            ...(grouped[dateStr] || { register: 0, recharge: 0, unlock: 0 })
        })
    }

    return { success: true, data: result }
})

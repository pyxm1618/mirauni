/**
 * 仪表盘数据 API
 * GET /api/admin/dashboard
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const supabase = createAdminSupabaseClient()
    const today = new Date().toISOString().split('T')[0]

    // 并行查询所有统计数据
    const [
        usersResult,
        todayUsersResult,
        projectsResult,
        pendingProjectsResult,
        paidOrdersResult,
        todayOrdersResult
    ] = await Promise.all([
        // 总用户数
        supabase.from('users').select('*', { count: 'exact', head: true }),
        // 今日新增用户
        supabase.from('users').select('*', { count: 'exact', head: true })
            .gte('created_at', `${today}T00:00:00`),
        // 总项目数
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        // 待审核项目
        supabase.from('projects').select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
        // 已支付订单总数
        supabase.from('orders').select('*', { count: 'exact', head: true })
            .eq('status', 'paid'),
        // 今日订单收入
        supabase.from('orders').select('amount')
            .eq('status', 'paid')
            .gte('created_at', `${today}T00:00:00`)
    ])

    // 计算今日收入
    const todayRevenue = todayOrdersResult.data?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0

    return {
        success: true,
        data: {
            stats: {
                totalUsers: usersResult.count || 0,
                todayNewUsers: todayUsersResult.count || 0,
                totalProjects: projectsResult.count || 0,
                pendingProjects: pendingProjectsResult.count || 0,
                totalOrders: paidOrdersResult.count || 0,
                todayRevenue
            }
        }
    }
})

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
        // No user: return zeros instead of mock data to prevent confusion
        return {
            totalGoal: 0,
            currentIncome: 0,
            progress: 0,
            daysLeft: 0,
            totalTasks: 0,
            completedTasks: 0
        }
    }

    const userId = user.id

    // 并行执行独立查询（优化：减少 50%+ 响应延迟）
    const [goalsResult, totalTasksResult, completedTasksResult] = await Promise.all([
        client
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1),
        client
            .from('tasks')
            .select('*, projects!inner(*)', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('projects.is_active', true),
        client
            .from('tasks')
            .select('*, projects!inner(*)', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'done')
            .eq('projects.is_active', true)
    ])

    const goal = goalsResult.data?.[0] || null
    const totalTasks = totalTasksResult.count
    const completedTasks = completedTasksResult.count

    // income 查询依赖 goal.id，需要串行
    let currentIncome = 0
    if (goal) {
        const { data: incomeData } = await client
            .from('income')
            .select('amount')
            .eq('user_id', userId)
            .eq('goal_id', goal.id)

        if (incomeData && incomeData.length > 0) {
            currentIncome = incomeData.reduce((sum, r) => sum + Number(r.amount || 0), 0)
        }
    }

    const totalGoal = Number(goal?.income_target || 0)
    const progress = totalGoal > 0 ? (currentIncome / totalGoal) * 100 : 0

    // Simple day calc
    const endOfYear = new Date(new Date().getFullYear(), 11, 31)
    const today = new Date()
    const daysLeft = Math.ceil((endOfYear.getTime() - today.getTime()) / (1000 * 3600 * 24))

    return {
        totalGoal,
        currentIncome,
        progress: Math.min(progress, 100), // Return number, not string
        daysLeft,
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0
    }
})

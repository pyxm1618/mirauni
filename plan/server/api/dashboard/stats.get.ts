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

    // 1. Get Goal (use order + limit to ensure deterministic result if multiple active goals exist)
    const { data: goals } = await client
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

    const goal = goals?.[0] || null

    // 2. Get Income from income table (sum all income for this goal/user)
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

    // 3. Get Task Stats
    // 3. Get Task Stats (Filter by active projects to respect archived plans)
    const { count: totalTasks } = await client
        .from('tasks')
        .select('*, projects!inner(*)', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('projects.is_active', true)

    const { count: completedTasks } = await client
        .from('tasks')
        .select('*, projects!inner(*)', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'done')
        .eq('projects.is_active', true)

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

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    // Get user from session or header (simplified for MVP, assuming middleware handles auth check or we get user from session)
    // For proper RLS, we should rely on supabase.auth.getUser() but here we might trust the client context or just query.
    // Ideally:
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
        // Return mock for dev if no user
        return {
            totalGoal: 100,
            currentIncome: 0,
            progress: 0,
            daysLeft: 180,
            totalTasks: 12,
            completedTasks: 3
        }
    }

    const userId = user.id

    // 1. Get Goal
    const { data: goal } = await client.from('goals').select('*').eq('user_id', userId).eq('status', 'active').single()

    // 2. Mock Income Tracking (We don't have income tracking table yet, maybe sum completed tasks value? For now 0)
    const currentIncome = 0

    // 3. Get Task Stats
    const { count: totalTasks } = await client.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    const { count: completedTasks } = await client.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'done')

    const totalGoal = goal?.income_target || 0
    const progress = totalGoal > 0 ? (currentIncome / totalGoal) * 100 : 0

    // Simple day calc
    const endOfYear = new Date(new Date().getFullYear(), 11, 31)
    const today = new Date()
    const daysLeft = Math.ceil((endOfYear.getTime() - today.getTime()) / (1000 * 3600 * 24))

    return {
        totalGoal,
        currentIncome,
        progress: Math.min(progress, 100).toFixed(1),
        daysLeft,
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0
    }
})

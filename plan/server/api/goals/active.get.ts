import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        return null
    }

    // Get active goal with counts
    const { data: goal, error } = await client
        .from('goals')
        .select('id, year, income_target, status, created_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error || !goal) {
        return null
    }

    // Get counts
    const { count: pathCount } = await client
        .from('paths')
        .select('*', { count: 'exact', head: true })
        .eq('goal_id', goal.id)

    // Filter by active projects. Schema should now support 'is_active'.
    const { count: projectCount } = await client
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)

    const { count: taskCount } = await client
        .from('tasks')
        .select('*, projects!inner(*)', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('projects.is_active', true)

    return {
        ...goal,
        pathCount: pathCount || 0,
        projectCount: projectCount || 0,
        taskCount: taskCount || 0
    }
})

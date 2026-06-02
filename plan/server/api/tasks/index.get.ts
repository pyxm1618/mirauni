import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) return [] // Mock empty or dev data

    // Use !inner to force join and filter by project status
    let dbQuery = client.from('tasks').select(`
    *,
    projects!inner (
        name,
        is_active,
        paths (
            name,
            category
        )
    )
  `).eq('user_id', user.id)
    .eq('projects.is_active', true) // Only show tasks from active projects

    // Filter by status if provided
    if (query.status) {
        dbQuery = dbQuery.eq('status', query.status)
    }

    // Filter by planned_date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    if (query.date === 'today') {
        dbQuery = dbQuery.eq('planned_date', todayStr)
    } else if (query.date === 'tomorrow') {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split('T')[0]
        dbQuery = dbQuery.eq('planned_date', tomorrowStr)
    } else if (query.date === 'week') {
        const weekEnd = new Date(today)
        weekEnd.setDate(weekEnd.getDate() + 7)
        const weekEndStr = weekEnd.toISOString().split('T')[0]
        dbQuery = dbQuery.gte('planned_date', todayStr).lte('planned_date', weekEndStr)
    } else if (query.date === 'upcoming') {
        // Next 30 days
        const futureEnd = new Date(today)
        futureEnd.setDate(futureEnd.getDate() + 30)
        const futureEndStr = futureEnd.toISOString().split('T')[0]
        dbQuery = dbQuery.gte('planned_date', todayStr).lte('planned_date', futureEndStr)
    }

    // Order by planned_date if filtering by date, otherwise by created_at
    if (query.date) {
        dbQuery = dbQuery.order('planned_date', { ascending: true }).order('sort_order', { ascending: true })
    } else {
        dbQuery = dbQuery.order('created_at', { ascending: false })
    }

    const { data, error } = await dbQuery

    if (error) throw createError({ statusCode: 500, message: error.message })

    return data
})

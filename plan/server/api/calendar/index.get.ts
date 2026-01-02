import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const query = getQuery(event)
    const year = parseInt(query.year as string) || new Date().getFullYear()
    const month = parseInt(query.month as string) || new Date().getMonth() + 1

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0) // Last day of month
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    // Fetch tasks for the month (only from active projects)
    const { data: tasks } = await client
        .from('tasks')
        .select('id, name, status, planned_date, projects!inner(name, is_active)')
        .eq('user_id', user.id)
        .gte('planned_date', startStr)
        .lte('planned_date', endStr)
        .eq('projects.is_active', true)
        .order('planned_date')

    // Fetch income for the month
    const { data: incomeRecords } = await client
        .from('income')
        .select('id, amount, note, recorded_at')
        .eq('user_id', user.id)
        .gte('recorded_at', startStr)
        .lte('recorded_at', endStr + 'T23:59:59')

    // Fetch check-ins for the month
    const { data: checkins } = await client
        .from('supervision_interactions')
        .select('id, created_at')
        .eq('sender_id', user.id)
        .eq('type', 'check_in')
        .gte('created_at', startStr)
        .lte('created_at', endStr + 'T23:59:59')

    // Aggregate data by date
    const daysMap: Record<string, {
        date: string,
        tasks: any[],
        income: any[],
        checkedIn: boolean
    }> = {}

    // Initialize all days of the month
    for (let d = 1; d <= endDate.getDate(); d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        daysMap[dateStr] = { date: dateStr, tasks: [], income: [], checkedIn: false }
    }

    // Populate tasks
    tasks?.forEach(task => {
        const dateStr = task.planned_date
        if (daysMap[dateStr]) {
            daysMap[dateStr].tasks.push({
                id: task.id,
                name: task.name,
                status: task.status,
                project_name: task.projects?.name || null
            })
        }
    })

    // Populate income
    incomeRecords?.forEach(inc => {
        const dateStr = inc.recorded_at.split('T')[0]
        if (daysMap[dateStr]) {
            daysMap[dateStr].income.push({
                id: inc.id,
                amount: inc.amount,
                note: inc.note
            })
        }
    })

    // Populate check-ins
    checkins?.forEach(ci => {
        const dateStr = ci.created_at.split('T')[0]
        if (daysMap[dateStr]) {
            daysMap[dateStr].checkedIn = true
        }
    })

    // Calculate summary
    const allTasks = tasks || []
    const summary = {
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter((t: any) => t.status === 'done').length,
        totalIncome: incomeRecords?.reduce((sum, i) => sum + Number(i.amount), 0) || 0,
        checkinDays: checkins?.length || 0
    }

    return {
        days: Object.values(daysMap),
        summary
    }
})

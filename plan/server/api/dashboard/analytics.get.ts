import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    // Default empty response
    const emptyResponse = {
        totalGoal: 0,
        currentIncome: 0,
        progress: 0,
        gap: 0,
        daysLeft: 0,
        paths: [],
        milestones: [],
        weekly: {
            tasksCompleted: 0,
            tasksDiff: 0,
            hoursSpent: 0,
            avgDaily: 0,
            streakDays: 0
        }
    }

    if (!user) {
        return emptyResponse
    }

    const userId = user.id

    // 1. Get Active Goal
    const { data: goals } = await client
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

    const goal = goals?.[0] || null
    if (!goal) {
        return emptyResponse
    }

    // 2. Get Income
    const { data: incomeData } = await client
        .from('income')
        .select('amount')
        .eq('user_id', userId)
        .eq('goal_id', goal.id)

    const currentIncome = incomeData?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0
    const totalGoal = Number(goal.income_target || 0)
    const progress = totalGoal > 0 ? (currentIncome / totalGoal) * 100 : 0
    const gap = Math.max(0, totalGoal - currentIncome)

    // Days left
    const endOfYear = new Date(new Date().getFullYear(), 11, 31)
    const today = new Date()
    const daysLeft = Math.ceil((endOfYear.getTime() - today.getTime()) / (1000 * 3600 * 24))

    // 3. Get Paths with task stats
    const { data: pathsData } = await client
        .from('paths')
        .select(`
            id, name, category, weight,
            projects (
                id, name, is_active, start_date, end_date, income_contribution,
                tasks (id, status, original_estimate)
            )
        `)
        .eq('goal_id', goal.id)
        .order('sort_order')

    const paths = (pathsData || []).map(path => {
        // Aggregate tasks from all projects
        let tasksTotal = 0
        let tasksCompleted = 0
        let incomeContribution = 0

            ; (path.projects || []).forEach((proj: any) => {
                if (proj.is_active) {
                    incomeContribution += Number(proj.income_contribution || 0)
                }
                ; (proj.tasks || []).forEach((task: any) => {
                    tasksTotal++
                    if (task.status === 'done') tasksCompleted++
                })
            })

        const completionRate = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0

        // Determine status based on expected vs actual
        let status: 'good' | 'warning' | 'danger' = 'good'
        // Simple heuristic: < 25% = danger, < 50% = warning
        if (completionRate < 25) status = 'danger'
        else if (completionRate < 50) status = 'warning'

        return {
            id: path.id,
            name: path.name,
            weight: path.weight || 100,
            completionRate,
            tasksCompleted,
            tasksTotal,
            incomeContribution,
            status
        }
    })

    // 4. Get Active Milestones
    const { data: milestonesData } = await client
        .from('projects')
        .select(`
            id, name, start_date, end_date, is_active,
            paths!inner (id, name, goal_id),
            tasks (id, status)
        `)
        .eq('paths.goal_id', goal.id)
        .eq('is_active', true)

    const milestones = (milestonesData || []).map(ms => {
        const tasksTotal = ms.tasks?.length || 0
        const tasksCompleted = ms.tasks?.filter((t: any) => t.status === 'done').length || 0
        const completionRate = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0

        // Check if delayed
        let isDelayed = false
        let delayDays = 0
        if (ms.end_date) {
            const endDate = new Date(ms.end_date)
            if (endDate < today && completionRate < 100) {
                isDelayed = true
                delayDays = Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 3600 * 24))
            }
        }

        return {
            id: ms.id,
            name: ms.name,
            pathName: (ms.paths as any)?.name || '',
            completionRate,
            tasksCompleted,
            tasksTotal,
            endDate: ms.end_date,
            isDelayed,
            delayDays
        }
    })

    // 5. Weekly Stats
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0]

    // This week's completed tasks
    const { data: thisWeekTasks } = await client
        .from('tasks')
        .select('id, original_estimate, completed_at')
        .eq('user_id', userId)
        .eq('status', 'done')
        .gte('completed_at', weekAgoStr)

    // Last week's completed tasks
    const { data: lastWeekTasks } = await client
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'done')
        .gte('completed_at', twoWeeksAgoStr)
        .lt('completed_at', weekAgoStr)

    const thisWeekCount = thisWeekTasks?.length || 0
    const lastWeekCount = lastWeekTasks?.length || 0
    const tasksDiff = thisWeekCount - lastWeekCount

    const hoursSpent = thisWeekTasks?.reduce((sum, t) => sum + Number(t.original_estimate || 0), 0) || 0
    const avgDaily = thisWeekCount / 7

    // Get check-in streak (from checkins table if exists, otherwise 0)
    let streakDays = 0
    try {
        const { data: checkins } = await client
            .from('checkins')
            .select('date')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(30)

        if (checkins && checkins.length > 0) {
            // Calculate streak
            const todayStr = today.toISOString().split('T')[0]
            let checkDate = new Date(today)

            for (const c of checkins) {
                const cDateStr = c.date
                const expectedStr = checkDate.toISOString().split('T')[0]

                if (cDateStr === expectedStr || cDateStr === todayStr) {
                    streakDays++
                    checkDate.setDate(checkDate.getDate() - 1)
                } else {
                    break
                }
            }
        }
    } catch (e) {
        // checkins table might not exist
    }

    return {
        totalGoal,
        currentIncome,
        progress: Math.min(progress, 100),
        gap,
        daysLeft,
        paths,
        milestones,
        weekly: {
            tasksCompleted: thisWeekCount,
            tasksDiff,
            hoursSpent,
            avgDaily,
            streakDays
        }
    }
})

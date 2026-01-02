import { serverSupabaseClient } from '#supabase/server'

/**
 * 时间分配算法
 * 
 * 输入：用户画像 + 所有路径/项目/任务
 * 输出：每个任务的 planned_date
 * 
 * 算法逻辑：
 * 1. 获取用户每周可用时间和工作日
 * 2. 计算每日可用工时
 * 3. 按路径开始日期排序
 * 4. 同一路径内按项目顺序、任务顺序分配日期
 * 5. 支持并行路径（不同路径可错开）
 */

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const userId = user.id

    // 1. 获取用户画像
    const { data: profile } = await client
        .from('user_profiles')
        .select('weekly_hours, work_days')
        .eq('user_id', userId)
        .single()

    const weeklyHours = profile?.weekly_hours ?? 20
    const workDays: number[] = profile?.work_days ?? [1, 2, 3, 4, 5]
    const dailyHours = weeklyHours / workDays.length

    // 2. 获取所有路径（按开始日期排序）
    const { data: paths } = await client
        .from('paths')
        .select('id, name, start_date, duration_weeks')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('start_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true })

    if (!paths || paths.length === 0) {
        return { success: true, message: '没有找到路径', tasks_updated: 0 }
    }

    // 3. 获取所有项目（按路径分组）
    const pathIds = paths.map(p => p.id)
    const { data: projects } = await client
        .from('projects')
        .select('id, path_id, name, start_date, duration_weeks, sort_order')
        .in('path_id', pathIds)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

    if (!projects || projects.length === 0) {
        return { success: true, message: '没有找到项目', tasks_updated: 0 }
    }

    // 4. 获取所有任务
    const projectIds = projects.map(p => p.id)
    const { data: tasks } = await client
        .from('tasks')
        .select('id, project_id, name, estimated_hours, sort_order')
        .in('project_id', projectIds)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

    if (!tasks || tasks.length === 0) {
        return { success: true, message: '没有找到任务', tasks_updated: 0 }
    }

    // 5. 构建项目到路径的映射
    const projectToPath: Record<string, any> = {}
    projects.forEach(proj => {
        projectToPath[proj.id] = paths.find(p => p.id === proj.path_id)
    })

    // 6. 构建任务到项目的映射，并按项目分组
    const tasksByProject: Record<string, any[]> = {}
    tasks.forEach(task => {
        if (!tasksByProject[task.project_id]) {
            tasksByProject[task.project_id] = []
        }
        tasksByProject[task.project_id].push(task)
    })

    // 7. 时间分配
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const taskUpdates: { id: string, planned_date: string }[] = []

    // 每条路径独立的日期指针
    const pathDatePointers: Record<string, Date> = {}

    for (const path of paths) {
        // 路径开始日期，默认今天
        let pathStartDate = path.start_date ? new Date(path.start_date) : new Date(today)
        if (pathStartDate < today) {
            pathStartDate = new Date(today)
        }
        pathDatePointers[path.id] = pathStartDate
    }

    // 为每个项目分配任务日期
    for (const project of projects) {
        const pathId = project.path_id
        const projectTasks = tasksByProject[project.id] || []

        if (projectTasks.length === 0) continue

        // 项目开始日期（可选），默认使用路径的当前指针
        let projectStartDate = project.start_date
            ? new Date(project.start_date)
            : new Date(pathDatePointers[pathId])

        if (projectStartDate < pathDatePointers[pathId]) {
            projectStartDate = new Date(pathDatePointers[pathId])
        }

        let currentDate = projectStartDate
        let accumulatedHours = 0

        for (const task of projectTasks) {
            const taskHours = task.estimated_hours ?? 2

            // 找到下一个工作日
            while (!workDays.includes(currentDate.getDay())) {
                currentDate.setDate(currentDate.getDate() + 1)
            }

            // 检查当天是否还有容量
            if (accumulatedHours + taskHours > dailyHours) {
                // 移到下一个工作日
                currentDate.setDate(currentDate.getDate() + 1)
                while (!workDays.includes(currentDate.getDay())) {
                    currentDate.setDate(currentDate.getDate() + 1)
                }
                accumulatedHours = 0
            }

            // 分配日期
            const plannedDate = currentDate.toISOString().split('T')[0]
            taskUpdates.push({ id: task.id, planned_date: plannedDate })

            accumulatedHours += taskHours

            // 如果一个任务超过一天的容量，移到下一天
            if (accumulatedHours >= dailyHours) {
                currentDate.setDate(currentDate.getDate() + 1)
                accumulatedHours = 0
            }
        }

        // 更新路径的日期指针到项目结束日期之后
        pathDatePointers[pathId] = new Date(currentDate)
    }

    // 8. 批量更新任务的 planned_date
    let updatedCount = 0
    for (const update of taskUpdates) {
        const { error } = await client
            .from('tasks')
            .update({ planned_date: update.planned_date })
            .eq('id', update.id)

        if (!error) {
            updatedCount++
        }
    }

    return {
        success: true,
        tasks_updated: updatedCount,
        message: `已为 ${updatedCount} 个任务分配了执行日期`
    }
})

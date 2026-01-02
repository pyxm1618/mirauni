import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)

    if (!body.name || !body.name.trim()) {
        throw createError({ statusCode: 400, message: 'Task name is required' })
    }

    // Find or create a default project for quick tasks
    let projectId = body.project_id

    if (!projectId) {
        // Try to find an existing "未分类" project
        const { data: existingProject } = await client
            .from('projects')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', '未分类任务')
            .single()

        if (existingProject) {
            projectId = existingProject.id
        } else {
            // Need to create a default path first, then project
            // Find or create a default path
            const { data: goal } = await client
                .from('goals')
                .select('id')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single()

            if (!goal) {
                throw createError({ statusCode: 400, message: '请先完成规划向导以设置年度目标' })
            }

            // Find or create default path
            let pathId: string
            const { data: existingPath } = await client
                .from('paths')
                .select('id')
                .eq('user_id', user.id)
                .eq('name', '其他')
                .single()

            if (existingPath) {
                pathId = existingPath.id
            } else {
                const { data: newPath, error: pathError } = await client
                    .from('paths')
                    .insert({
                        user_id: user.id,
                        goal_id: goal.id,
                        name: '其他',
                        category: 'other'
                    })
                    .select()
                    .single()

                if (pathError) throw createError({ statusCode: 500, message: pathError.message })
                pathId = newPath.id
            }

            // Create default project
            const { data: newProject, error: projectError } = await client
                .from('projects')
                .insert({
                    user_id: user.id,
                    path_id: pathId,
                    name: '未分类任务'
                })
                .select()
                .single()

            if (projectError) throw createError({ statusCode: 500, message: projectError.message })
            projectId = newProject.id
        }
    }

    // Create the task
    const { data, error } = await client.from('tasks').insert({
        user_id: user.id,
        project_id: projectId,
        name: body.name.trim(),
        status: 'todo'
    }).select().single()

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return data
})

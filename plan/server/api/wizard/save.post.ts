export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { plan, user_id } = body

    // 正式环境 - 使用 Supabase
    const { serverSupabaseUser, serverSupabaseClient } = await import('#supabase/server')
    const user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient(event)

    // 开发模式下，如果没有配置 Supabase 且没有用户登录（模拟模式），直接返回成功
    const supabaseUrl = process.env.SUPABASE_URL
    if ((!supabaseUrl || supabaseUrl === 'your-supabase-url') && !user) {
        console.log('[Mock] Wizard save - no Supabase configured')
        return {
            success: true,
            goalId: 'mock-goal-' + Date.now(),
            message: 'Mock save successful (Supabase not configured)'
        }
    }

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Validate required fields
    if (!plan || plan.incomeGoal === null || plan.incomeGoal === undefined) {
        throw createError({
            statusCode: 400,
            message: '收入目标不能为空。请返回第一步填写收入目标。'
        })
    }

    if (!plan.paths || plan.paths.length === 0) {
        throw createError({
            statusCode: 400,
            message: '请至少添加一个赚钱路径'
        })
    }

    // Security: Use authenticated user ID
    const userId = user.id

    try {
        // 动态计算目标年份
        const now = new Date()
        const targetYear = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear()

        // 1. Create Goal
        const { data: goalData, error: goalError } = await client
            .from('goals')
            .insert({
                user_id: userId,
                year: targetYear,
                income_target: plan.incomeGoal,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (goalError) {
            throw createError({ statusCode: 500, message: goalError.message })
        }

        const goalId = goalData.id

        // 2. Create Paths
        const pathsToInsert = plan.paths.map((p: any, index: number) => ({
            goal_id: goalId,
            user_id: userId,
            name: p.name,
            category: p.category || 'other',
            income_target: (p.incomeMin + p.incomeMax) / 2,
            sort_order: index,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }))

        const { data: pathsData, error: pathsError } = await client
            .from('paths')
            .insert(pathsToInsert)
            .select()

        if (pathsError) {
            throw createError({ statusCode: 500, message: pathsError.message })
        }

        // 3. Create default projects and tasks for each path
        for (const path of pathsData) {
            const { data: projectData } = await client.from('projects').insert({
                path_id: path.id,
                user_id: userId,
                name: `启动项目: ${path.name}`,
                status: 'todo',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }).select().single()

            if (projectData) {
                await client.from('tasks').insert([
                    { project_id: projectData.id, user_id: userId, name: '调研与计划', status: 'todo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                    { project_id: projectData.id, user_id: userId, name: '执行第一步', status: 'todo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
                ])
            }
        }

        return { success: true, goalId }
    } catch (e: any) {
        console.error('[Wizard Save Error]', e)
        throw createError({ statusCode: 500, message: e.message || 'Save failed' })
    }
})

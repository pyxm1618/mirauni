import { serverSupabaseServiceRole, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const userId = getRouterParam(event, 'userId')

    console.log('[公开契约API] 收到请求，userId:', userId)

    let goal: any = null
    let nickname = "搞钱合伙人"

    try {
        // 优先使用 Service Role 绕过 RLS
        const adminClient = serverSupabaseServiceRole(event)

        // 获取用户的活跃目标
        const { data, error } = await adminClient
            .from('goals')
            .select('income_target, created_at')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        console.log('[公开契约API] Service Role 查询结果:', { data, error: error?.message })

        if (error) {
            throw error
        }

        goal = data

        // 尝试从 auth.users 获取用户信息
        try {
            const { data: userData } = await adminClient.auth.admin.getUserById(userId as string)
            if (userData?.user?.user_metadata?.nickname) {
                nickname = userData.user.user_metadata.nickname
            }
        } catch (e) {
            console.warn('[公开契约API] 获取用户昵称失败:', e)
        }

    } catch (adminError: any) {
        console.error('[公开契约API] Service Role 查询失败:', adminError.message)

        // 备用方案：使用普通客户端（如果表设置了公开读取策略）
        try {
            const client = await serverSupabaseClient(event)
            const { data, error } = await client
                .from('goals')
                .select('income_target, created_at')
                .eq('user_id', userId)
                .eq('status', 'active')
                .single()

            console.log('[公开契约API] 普通客户端查询结果:', { data, error: error?.message })

            if (error || !data) {
                throw createError({
                    statusCode: 404,
                    message: 'Plan not found'
                })
            }

            goal = data
        } catch (clientError: any) {
            console.error('[公开契约API] 备用查询也失败:', clientError.message)
            throw createError({
                statusCode: 404,
                message: 'Plan not found'
            })
        }
    }

    if (!goal) {
        throw createError({ statusCode: 404, message: 'Plan not found' })
    }

    return {
        userId,
        nickname,
        incomeTarget: goal.income_target,
        createdAt: goal.created_at
    }
})

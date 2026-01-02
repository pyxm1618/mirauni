import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const userId = getRouterParam(event, 'userId')

    console.log('[公开契约API] 收到请求，userId:', userId)

    // 使用 Service Role 绕过 RLS，允许未登录用户查看公开契约信息
    const client = serverSupabaseServiceRole(event)

    // 获取用户的活跃目标
    const { data: goal, error } = await client
        .from('goals')
        .select('income_target, created_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

    console.log('[公开契约API] 查询结果:', { goal, error })

    if (error || !goal) {
        console.error('[公开契约API] 未找到规划:', { userId, error: error?.message })
        throw createError({ statusCode: 404, message: 'Plan not found' })
    }

    // 尝试从 auth.users 获取用户信息
    let nickname = "搞钱合伙人"
    try {
        const { data: userData } = await client.auth.admin.getUserById(userId as string)
        if (userData?.user?.user_metadata?.nickname) {
            nickname = userData.user.user_metadata.nickname
        }
    } catch (e) {
        // 获取失败时使用默认昵称
        console.warn('Failed to fetch user info:', e)
    }

    return {
        userId,
        nickname,
        incomeTarget: goal.income_target,
        createdAt: goal.created_at
    }
})


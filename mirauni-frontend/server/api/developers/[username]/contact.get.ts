import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const targetUsername = getRouterParam(event, 'username')
    const user = await serverSupabaseUser(event)
    const supabase = await serverSupabaseClient(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: '请先登录'
        })
    }

    // 1. 根据 username 获取目标用户 ID
    const { data: targetUser, error: targetError } = await supabase
        .from('users')
        .select('id')
        .eq('username', targetUsername)
        .single()

    if (targetError || !targetUser) {
        throw createError({
            statusCode: 404,
            message: '用户不存在'
        })
    }

    const targetUserId = targetUser.id

    // 2. 检查是否是自己
    if (user.id === targetUserId) {
        const { data, error } = await supabase
            .from('users')
            .select('wechat_id, email, phone')
            .eq('id', targetUserId)
            .single()

        if (error) throw error
        return { success: true, data }
    }

    // 3. 检查是否已解锁
    const { data: unlock } = await supabase
        .from('unlocks')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_user_id', targetUserId)
        .single()

    if (!unlock) {
        throw createError({
            statusCode: 403,
            message: '需要解锁才能查看联系方式',
            data: { code: 'NOT_UNLOCKED' }
        })
    }

    // 4. 返回联系方式
    const { data, error } = await supabase
        .from('users')
        .select('wechat_id, email')
        .eq('id', targetUserId)
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message
        })
    }

    return {
        success: true,
        data
    }
})

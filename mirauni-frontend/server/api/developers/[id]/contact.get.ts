import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const targetUserId = getRouterParam(event, 'id')
    const user = await serverSupabaseUser(event)
    const supabaseAdmin = serverSupabaseServiceRole(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: '请先登录'
        })
    }

    // 1. 检查是否是自己
    if (user.id === targetUserId) {
        // 使用 service_role 读取自己本人的敏感字段以应对收紧的 users RLS
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('wechat_id, email, phone')
            .eq('id', targetUserId)
            .single()

        if (error) throw error
        return { success: true, data }
    }

    // 2. 检查是否已解锁
    const { data: unlock } = await supabaseAdmin
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

    // 3. 安全获取：使用 service_role 提取已解锁的联系方式并返回
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('wechat_id, email, phone')
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

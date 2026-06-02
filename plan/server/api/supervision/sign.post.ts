import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { userId, signature } = body // userId is the target (plan owner)
    const client = await serverSupabaseClient(event)

    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        throw createError({ statusCode: 401, message: '请先登录' })
    }

    const supervisorId = user.id
    const meta = user.user_metadata || {}
    const nickname = meta.nickname || meta.full_name || user.email?.split('@')[0] || '神秘人'
    const avatar = meta.avatar_url || meta.picture || ''

    // Self supervision check
    if (supervisorId === userId) {
        throw createError({ statusCode: 400, message: '不能做自己的监督人哦' })
    }

    // Check if already exists
    const { data: existing } = await client.from('supervisions')
        .select('id')
        .eq('user_id', userId)
        .eq('supervisor_id', supervisorId)
        .single()

    if (existing) {
        return { success: true, message: '已经签过啦' }
    }

    const { error } = await client.from('supervisions').insert({
        user_id: userId,
        supervisor_id: supervisorId,
        supervisor_nickname: nickname,
        supervisor_avatar: avatar,
        status: 'active',
        created_at: new Date().toISOString()
    })

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    // Add a system interaction msg
    await client.from('supervision_interactions').insert({
        sender_id: supervisorId,
        receiver_id: userId,
        type: 'system',
        message: '已签署搞钱监督契约',
        created_at: new Date().toISOString()
    })

    return { success: true }
})

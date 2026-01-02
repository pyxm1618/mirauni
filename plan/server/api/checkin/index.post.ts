import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Check last check-in to prevent spam (e.g., once per hour or day?)
    // For now, let's just log it. In real app, we might check `supervision_interactions` log.

    // We will log a "check-in" interaction as a self-interaction or system interaction
    const { error } = await client.from('supervision_interactions').insert({
        sender_id: user.id,
        receiver_id: user.id, // Self check-in
        type: 'check_in',
        message: '完成了今日打卡',
        created_at: new Date().toISOString()
    })

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return { success: true }
})

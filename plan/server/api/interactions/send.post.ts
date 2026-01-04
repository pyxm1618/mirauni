import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { targetUserId, type } = body
    const client = await serverSupabaseClient(event)

    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        throw createError({ statusCode: 401, message: '请先登录' })
    }

    // Prevent spamming self
    if (user.id === targetUserId) {
        throw createError({ statusCode: 400, message: '对自己好一点，不用催自己' })
    }

    // Insert interaction
    // 'supervision_interactions' table
    const { error } = await client.from('supervision_interactions').insert({
        receiver_id: targetUserId,
        sender_id: user.id,
        type: type, // 'like' | 'nudge'
        created_at: new Date().toISOString()
    })

    if (error) {
        console.error('Interaction DB Error:', error.message)
        // Mock success for MVP
        throw createError({ statusCode: 500, message: '发送失败，请稍后重试' })
    }

    return { success: true }
})

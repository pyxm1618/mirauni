import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { z } from 'zod'

const sendBodySchema = z.object({
    toUserId: z.string().uuid(),
    content: z.string().min(1).max(500) // 文档规定: 单条消息最长 500 字
})

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const body = await readBody(event)
    const result = sendBodySchema.safeParse(body)
    if (!result.success) {
        throw createError({ statusCode: 400, message: 'Validation Error', data: result.error.flatten() })
    }
    const { toUserId, content } = result.data

    if (toUserId === user.id) {
        throw createError({ statusCode: 400, message: 'Cannot send message to self' })
    }

    const client = await serverSupabaseClient(event)

    // 1. Check if conversation exists (Sorting IDs ensures uniqueness)
    const [u1, u2] = [user.id, toUserId].sort()

    const { data: conversation } = await client
        .from('conversations')
        .select('id')
        .eq('user1_id', u1)
        .eq('user2_id', u2)
        .single()

    let conversationId = conversation?.id

    if (!conversationId) {
        // 2. No conversation, check permission (unlocks)
        // 文档规定: 必须先解锁对方联系方式才能发消息 (发送方 -> 接收方)
        const { data: unlock } = await client
            .from('unlocks')
            .select('id')
            .eq('user_id', user.id)
            .eq('target_user_id', toUserId)
            .single()

        if (!unlock) {
            throw createError({ statusCode: 403, message: 'Need to unlock contact first', statusMessage: 'NOT_UNLOCKED' })
        }
    }

    // 3. 检查发送频率 (文档规定: 同一会话每分钟最多发送 5 条)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const { count: recentCount } = await client
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('from_user_id', user.id)
        .eq('to_user_id', toUserId)
        .gte('created_at', oneMinuteAgo)

    if (recentCount && recentCount >= 5) {
        throw createError({ statusCode: 429, message: 'Rate limited: max 5 messages per minute' })
    }

    // 4. Create conversation if not exists
    if (!conversationId) {

        // 3. Create conversation
        const { data: newConv, error: convCreateError } = await client
            .from('conversations')
            .insert({
                user1_id: u1,
                user2_id: u2,
                last_message_at: new Date().toISOString()
            })
            .select('id')
            .single()

        if (convCreateError) throw createError({ statusCode: 500, message: 'Failed to create conversation' })
        conversationId = newConv.id
    } else {
        // Update last_message_at
        await client.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId)
    }

    // 4. Send Message
    const { data: message, error: sendError } = await client
        .from('messages')
        .insert({
            conversation_id: conversationId,
            from_user_id: user.id,
            to_user_id: toUserId,
            content,
            is_read: false
        })
        .select()
        .single()

    if (sendError) throw createError({ statusCode: 500, message: sendError.message })

    return { success: true, data: message }
})

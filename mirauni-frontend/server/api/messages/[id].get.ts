import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const conversationId = getRouterParam(event, 'id')
    if (!conversationId) {
        throw createError({ statusCode: 400, message: 'Missing conversation ID' })
    }

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 50
    const from = (page - 1) * pageSize

    const client = await serverSupabaseClient(event)

    // Verify membership of conversation
    // Verify membership of conversation and fetch info
    const { data: conversation, error: convError } = await client
        .from('conversations')
        .select(`
            id,
            user1:users!user1_id(id, username, avatar_url),
            user2:users!user2_id(id, username, avatar_url)
        `)
        .eq('id', conversationId)
        .single()

    if (convError || !conversation) {
        throw createError({ statusCode: 404, message: 'Conversation not found' })
    }

    // @ts-ignore
    if (conversation.user1.id !== user.id && conversation.user2.id !== user.id) {
        throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    // @ts-ignore
    const otherUser = conversation.user1.id === user.id ? conversation.user2 : conversation.user1


    // Fetch messages
    const { data, error, count } = await client
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1)

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return {
        success: true,
        data,
        conversation: {
            id: conversation.id,
            otherUser
        },
        meta: {
            total: count,
            page,
            pageSize
        }
    }
})

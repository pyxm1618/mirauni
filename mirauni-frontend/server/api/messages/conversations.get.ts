import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = await serverSupabaseClient(event)

    // Fetch conversations where user is either user1 or user2
    // Include user details and latest message
    // Note: PostgREST embedding limit/order
    const { data, error } = await client
        .from('conversations')
        .select(`
      id,
      last_message_at,
      user1:users!user1_id(id, username, avatar_url, role),
      user2:users!user2_id(id, username, avatar_url, role),
      messages(content, created_at, is_read, from_user_id)
    `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })
        .order('created_at', { ascending: false, foreignTable: 'messages' })
        .limit(1, { foreignTable: 'messages' })

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    // Format response
    // 1. Identify "other" user
    // 2. Flatten latest message
    const conversations = data.map(item => {
        // @ts-ignore
        const otherUser = item.user1.id === user.id ? item.user2 : item.user1
        // @ts-ignore
        const latestMsg = item.messages?.[0] || null

        return {
            id: item.id,
            otherUser,
            lastMessage: latestMsg,
            updatedAt: item.last_message_at
        }
    })

    return {
        success: true,
        data: conversations
    }
})

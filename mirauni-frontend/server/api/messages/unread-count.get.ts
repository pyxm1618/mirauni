import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = await serverSupabaseClient(event)

    const { count, error } = await client
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', user.id)
        .eq('is_read', false)

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return { unreadCount: count || 0 }
})

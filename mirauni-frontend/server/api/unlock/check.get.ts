import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        // If not logged in, definitely not unlocked (unless self? but no user id)
        return { unlocked: false }
    }

    const query = getQuery(event)
    const targetUserId = query.targetUserId as string

    if (!targetUserId) {
        throw createError({ statusCode: 400, message: 'Target User ID required' })
    }

    if (targetUserId === user.id) {
        return { unlocked: true }
    }

    const client = await serverSupabaseClient(event)

    const { data } = await client
        .from('unlocks')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_user_id', targetUserId)
        .single()

    return {
        unlocked: !!data
    }
})

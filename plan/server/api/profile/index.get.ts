import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Get user profile
    const { data: profile } = await client
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!profile) {
        // Return default profile if not exists
        return {
            weekly_hours: 20,
            work_days: [1, 2, 3, 4, 5], // Mon-Fri
            background: 'other',
            constraints: []
        }
    }

    return profile
})

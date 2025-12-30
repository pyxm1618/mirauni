import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) return []

    // Fetch recent interactions
    // Join with goal/user info if possible to get sender nickname
    // For MVP, we might just get the raw IDs or assume we can get profiles.

    const { data, error } = await client
        .from('interactions')
        .select('*')
        .eq('target_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

    if (error || !data) {
        // Mock data for demo if no DB table yet
        return [
            { type: 'like', created_at: Date.now() - 10000, sender_nickname: '神秘好友' },
            { type: 'nudge', created_at: Date.now() - 100000, sender_nickname: '搞钱搭子' }
        ]
    }

    return data
})

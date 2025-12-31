import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    // Auth check logic simplified for MVP (trusting client context or session)
    // Production would use proper middleware or getUser()
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        return { supervisors: [], interactions: [], alertLevel: 'normal' }
    }

    const userId = user.id

    // 1. Get Supervisors
    const { data: supervisors } = await client
        .from('supervisions')
        .select('id, supervisor_nickname, supervisor_avatar, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(5)

    // 2. Get Recent Interactions
    const { data: interactions } = await client
        .from('supervision_interactions')
        .select('*')
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

    // 3. Mock Alert Level (Future: calculate based on task inactivity)
    // 'normal' | 'earning' | 'danger'
    const alertLevel = 'normal'

    return {
        supervisors: supervisors || [],
        interactions: interactions || [],
        alertLevel
    }
})

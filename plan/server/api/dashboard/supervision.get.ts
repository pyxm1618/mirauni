import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        return { supervisors: [], interactions: [], alertLevel: 'normal', checkinStreak: 0 }
    }

    const userId = user.id

    // 1. Get Supervisors
    const { data: supervisors } = await client
        .from('supervisions')
        .select('id, supervisor_id, supervisor_nickname, supervisor_avatar, status')
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

    // 2.5 Enrich Interactions with Sender Info
    const enrichedInteractions = interactions?.map(i => {
        // Find supervisor who sent this
        const supervisor = supervisors?.find(s => s.supervisor_id === i.sender_id)
        return {
            ...i,
            sender_nickname: supervisor?.supervisor_nickname || '神秘好友',
            sender_avatar: supervisor?.supervisor_avatar
        }
    }) || []

    // 3. Calculate Check-in Streak (consecutive days)
    const { data: checkins } = await client
        .from('supervision_interactions')
        .select('created_at')
        .eq('sender_id', userId)
        .eq('type', 'check_in')
        .order('created_at', { ascending: false })
        .limit(365) // Check up to a year

    let checkinStreak = 0
    if (checkins && checkins.length > 0) {
        // Helper: Get local YYYY-MM-DD
        const getLocalStr = (d: Date | string) => {
            const date = new Date(d)
            // Adjust for local timezone offset
            const offset = date.getTimezoneOffset() * 60000
            const localDate = new Date(date.getTime() - offset)
            return localDate.toISOString().split('T')[0]
        }

        const today = new Date()
        const todayStr = getLocalStr(today)

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = getLocalStr(yesterday)

        // Get unique dates in local time
        const uniqueDates = [...new Set(checkins.map(c => getLocalStr(c.created_at)))].sort().reverse()

        // Check if today or yesterday has a check-in
        if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
            // Count consecutive days
            let expectedDate = new Date(uniqueDates[0])

            for (const dateStr of uniqueDates) {
                const expectedStr = getLocalStr(expectedDate)

                if (dateStr === expectedStr) {
                    checkinStreak++
                    // Move expected date back by 1 day
                    expectedDate.setDate(expectedDate.getDate() - 1)
                } else {
                    break
                }
            }
        }
    }

    // 4. Alert Level (Future: calculate based on task inactivity)
    const alertLevel = 'normal'

    return {
        supervisors: supervisors || [],
        interactions: enrichedInteractions,
        alertLevel,
        checkinStreak
    }
})

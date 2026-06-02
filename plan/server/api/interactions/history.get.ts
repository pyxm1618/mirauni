import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        throw createError({ statusCode: 401, message: '请先登录' })
    }

    const query = getQuery(event)
    const limit = Number(query.limit) || 20
    const page = Number(query.page) || 1
    const offset = (page - 1) * limit

    // 1. Get Interactions
    const { data: interactions, count } = await client
        .from('supervision_interactions')
        .select('*', { count: 'exact' })
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (!interactions || interactions.length === 0) {
        return { list: [], total: 0 }
    }

    // 2. Enrich with Sender Info (Supervisor)
    // We need to fetch supervisor info. The interactions table has sender_id.
    // We can query the 'supervisions' table or 'profiles' table. 
    // Assuming 'supervisions' links sender_id (supervisor_id) to user info.
    
    // Better: Get sender profiles directly if possible, or join. 
    // For MVP, we query supervisions table to find nickname if they are supervisors.
    
    const senderIds = [...new Set(interactions.map(i => i.sender_id))]
    
    const { data: supervisors } = await client
        .from('supervisions')
        .select('supervisor_id, supervisor_nickname, supervisor_avatar')
        .eq('user_id', user.id)
        .in('supervisor_id', senderIds)
        
    const enriched = interactions.map(i => {
        const sup = supervisors?.find(s => s.supervisor_id === i.sender_id)
        return {
            id: i.id,
            type: i.type,
            created_at: i.created_at,
            sender_id: i.sender_id,
            sender_nickname: sup?.supervisor_nickname || '未知用户', // Fallback
            sender_avatar: sup?.supervisor_avatar
        }
    })

    return {
        list: enriched,
        total: count || 0,
        page,
        hasMore: (offset + limit) < (count || 0)
    }
})
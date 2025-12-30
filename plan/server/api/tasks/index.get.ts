import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) return [] // Mock empty or dev data

    let dbQuery = client.from('tasks').select(`
    *,
    projects (
        name,
        paths (
            name,
            category
        )
    )
  `).eq('user_id', user.id).order('created_at', { ascending: false })

    // Filter by status if provided
    if (query.status) {
        dbQuery = dbQuery.eq('status', query.status)
    }

    const { data, error } = await dbQuery

    if (error) throw createError({ statusCode: 500, message: error.message })

    return data
})

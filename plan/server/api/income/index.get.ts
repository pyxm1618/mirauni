import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const { data, error } = await client
        .from('income')
        .select(`
            id,
            amount,
            note,
            recorded_at,
            projects (
                id,
                name
            )
        `)
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return data
})

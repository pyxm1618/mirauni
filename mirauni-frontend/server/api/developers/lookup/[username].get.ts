import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const username = getRouterParam(event, 'username')
    const supabase = await serverSupabaseClient(event)

    if (!username) {
        throw createError({
            statusCode: 400,
            message: 'Username is required'
        })
    }

    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

    if (error || !data) {
        throw createError({
            statusCode: 404,
            message: 'User not found'
        })
    }

    return { id: data.id }
})

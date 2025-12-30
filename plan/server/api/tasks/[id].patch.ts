import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const client = await serverSupabaseClient(event)

    const { data, error } = await client
        .from('tasks')
        .update(body)
        .eq('id', id)
        .select()
        .single()

    if (error) throw createError({ statusCode: 500, message: error.message })

    return data
})

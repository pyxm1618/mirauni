import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const client = await serverSupabaseClient(event)

    const { error } = await client
        .from('tasks')
        .delete()
        .eq('id', id)

    if (error) throw createError({ statusCode: 500, message: error.message })

    return { success: true }
})

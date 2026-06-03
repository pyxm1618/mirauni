import { serverSupabaseUser, serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = await serverSupabaseClient(event)

    // Verify ownership using user client
    const { data: existing, error: fetchError } = await client
        .from('mirauni_projects')
        .select('user_id')
        .eq('id', id)
        .single()

    if (fetchError || !existing) {
        throw createError({ statusCode: 404, message: 'Project not found' })
    }

    if (existing.user_id !== user.id) {
        throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    // Soft Delete (change status to closed) using adminClient
    const adminClient = serverSupabaseServiceRole(event)
    const { data, error } = await adminClient
        .from('mirauni_projects')
        .update({ status: 'closed' })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return { success: true, data }
})

import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { projectSchema } from '~/types/index'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)

    // Validate
    const result = projectSchema.safeParse(body)
    if (!result.success) {
        throw createError({
            statusCode: 400,
            data: {
                code: 'VALIDATION_ERROR',
                errors: result.error.flatten().fieldErrors
            }
        })
    }

    const client = await serverSupabaseClient(event)

    // Verify ownership
    const { data: existing, error: fetchError } = await client
        .from('projects')
        .select('user_id')
        .eq('id', id)
        .single()

    if (fetchError || !existing) {
        throw createError({ statusCode: 404, message: 'Project not found' })
    }

    if (existing.user_id !== user.id) {
        throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    // Update
    const { data, error } = await client
        .from('projects')
        .update(result.data)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return { success: true, data }
})

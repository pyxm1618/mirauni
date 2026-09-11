import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { projectSchema } from '~/types/index'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
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
    const { data: existing, error: fetchError } = await client
        .from('mirauni_projects')
        .select('user_id, listing_type')
        .eq('id', id)
        .single()

    if (fetchError || !existing) {
        throw createError({ statusCode: 404, message: 'Project not found' })
    }

    if (existing.user_id !== user.id) {
        throw createError({ statusCode: 403, message: 'Forbidden' })
    }

    if (existing.listing_type === 'curated') {
        throw createError({ statusCode: 403, message: 'Curated projects are managed by the platform' })
    }

    const { data, error } = await client
        .from('mirauni_projects')
        .update({
            ...result.data,
            listing_type: 'owner',
            source_repo: null,
            source_url: null,
            curated_meta: {},
            curation_rank: null
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return { success: true, data }
})

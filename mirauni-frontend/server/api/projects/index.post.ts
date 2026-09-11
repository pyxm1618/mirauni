import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { projectSchema } from '~/types/index'

export default defineEventHandler(async (event) => {
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
    const { data, error } = await client
        .from('mirauni_projects')
        .insert({
            ...result.data,
            user_id: user.id,
            listing_type: 'owner',
            source_repo: null,
            source_url: null,
            curated_meta: {},
            curation_rank: null
        })
        .select()
        .single()

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return { success: true, data }
})

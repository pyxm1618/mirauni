import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    const client = await serverSupabaseClient(event)

    const { data, error } = await client
        .from('articles')
        .select('*, author:users!author_id(username, avatar_url)')
        .eq('slug', slug)
        .maybeSingle()

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message
        })
    }

    if (!data || data.status !== 'published') {
        throw createError({
            statusCode: 404,
            message: 'Article not found'
        })
    }

    return {
        success: true,
        data
    }
})

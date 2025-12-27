
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

    if (!data) {
        throw createError({
            statusCode: 404,
            message: 'Article not found'
        })
    }

    // Increment view count (optional, doing it simple here, ideally use RPC or specialized endpoint to avoid auth issue if user is anon)
    // But RLS might prevent update if anon. So we skip update for now or need a service key client (not available here easily without env).
    // For V1, we just read.

    return {
        success: true,
        data
    }
})

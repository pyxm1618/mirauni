
import { serverSupabaseClient } from '#supabase/server'
import { getSampleArticleBySlug } from '~/server/utils/sample-articles'

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

    // 状态边界拦截：如果文章状态不是 published，直接返回 404
    if (data && data.status !== 'published') {
        throw createError({
            statusCode: 404,
            message: 'Article not found'
        })
    }

    if (!data) {
        const sample = getSampleArticleBySlug(String(slug || ''))
        if (!sample || sample.status !== 'published') {
            throw createError({
                statusCode: 404,
                message: 'Article not found'
            })
        }
        return {
            success: true,
            data: sample
        }
    }

    return {
        success: true,
        data
    }
})

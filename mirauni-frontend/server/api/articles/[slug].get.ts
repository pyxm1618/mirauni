import { serverSupabaseClient } from '#supabase/server'
import { academyCategories, academyCategoryMap, getAcademyArticleBySlug } from '~/data/academy-content'

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 404, message: 'Article not found' })
    }

    const curatedArticle = getAcademyArticleBySlug(slug)
    if (curatedArticle) {
        return {
            success: true,
            data: curatedArticle,
        }
    }

    const allowedCategories = new Set(academyCategories.map((item) => item.id))

    try {
        const client = await serverSupabaseClient(event)
        const { data, error } = await client
            .from('articles')
            .select('*, author:users!author_id(username, avatar_url)')
            .eq('slug', slug)
            .maybeSingle()

        if (error) {
            throw createError({ statusCode: 500, message: error.message })
        }

        if (!data || data.status !== 'published' || !allowedCategories.has(data.category as any)) {
            throw createError({ statusCode: 404, message: 'Article not found' })
        }

        return {
            success: true,
            data: {
                ...data,
                series: academyCategoryMap[data.category as keyof typeof academyCategoryMap]?.label || data.category,
                sources: [],
            },
        }
    } catch (error: any) {
        if (error?.statusCode) throw error
        throw createError({ statusCode: 404, message: 'Article not found' })
    }
})

import { serverSupabaseClient } from '#supabase/server'
import { academyArticles, academyCategories, academyCategoryMap } from '~/data/academy-content'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const page = Math.max(parseInt(query.page as string) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(query.pageSize as string) || 30, 1), 100)
    const category = typeof query.category === 'string' ? query.category : 'all'
    const allowedCategories = new Set(academyCategories.map((item) => item.id))

    let databaseArticles: any[] = []

    try {
        const client = await serverSupabaseClient(event)
        const { data, error } = await client
            .from('articles')
            .select('id, title, slug, summary, category, cover_url, created_at, updated_at, view_count, author:users!author_id(username, avatar_url)')
            .eq('status', 'published')
            .order('created_at', { ascending: false })

        if (!error && data) {
            const curatedSlugs = new Set(academyArticles.map((article) => article.slug))
            databaseArticles = data
                .filter((article: any) => allowedCategories.has(article.category) && !curatedSlugs.has(article.slug))
                .map((article: any) => ({
                    ...article,
                    series: academyCategoryMap[article.category as keyof typeof academyCategoryMap]?.label || article.category,
                    sources: [],
                }))
        }
    } catch {
        // Curated academy content is deliberately self-contained so the public academy
        // remains available even when the database is unavailable in preview environments.
    }

    const allArticles = [...academyArticles, ...databaseArticles]
    const filtered = category === 'all'
        ? allArticles
        : allowedCategories.has(category as any)
            ? allArticles.filter((article) => article.category === category)
            : []

    const from = (page - 1) * pageSize
    const data = filtered.slice(from, from + pageSize)

    return {
        success: true,
        data,
        meta: {
            total: filtered.length,
            page,
            pageSize,
        },
    }
})

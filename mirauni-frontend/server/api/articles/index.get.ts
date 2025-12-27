
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const client = await serverSupabaseClient(event)

    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 10

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let builder = client
        .from('articles')
        .select('id, title, slug, summary, category, cover_url, created_at, view_count, author:users!author_id(username, avatar_url)', { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })

    if (query.category && query.category !== 'all') {
        builder = builder.eq('category', query.category)
    }

    const { data, count, error } = await builder.range(from, to)

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message,
        })
    }

    return {
        success: true,
        data: data,
        meta: {
            total: count,
            page,
            pageSize
        }
    }
})

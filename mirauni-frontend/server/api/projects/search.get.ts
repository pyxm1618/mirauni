import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const client = await serverSupabaseClient(event)

    let request = client
        .from('projects')
        .select('*, users!projects_user_id_fkey(username, avatar_url)', { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    // Filters
    if (query.category) {
        request = request.eq('category', query.category)
    }

    if (query.role) {
        request = request.contains('roles_needed', [query.role])
    }

    if (query.skill) {
        request = request.contains('skills_required', [query.skill])
    }

    if (query.work_mode) {
        request = request.eq('work_mode', query.work_mode)
    }

    if (query.keyword) {
        const kw = query.keyword
        request = request.or(`title.ilike.%${kw}%,summary.ilike.%${kw}%`)
    }

    // Pagination
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    request = request.range(from, to)

    const { data, error, count } = await request

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message
        })
    }

    return {
        success: true,
        data,
        meta: {
            total: count,
            page,
            pageSize
        }
    }
})

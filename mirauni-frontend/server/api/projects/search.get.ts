import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const client = await serverSupabaseClient(event)

    let request = client
        .from('mirauni_projects')
        .select('*', { count: 'exact' })
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

    // 内存合并 public_profiles 物理表中的公开用户信息，保证数据合规不越权
    const userIds = [...new Set((data || []).map(p => p.user_id).filter(Boolean))]

    const { data: profiles } = userIds.length
        ? await client
            .from('public_profiles')
            .select('id, username, avatar_url')
            .in('id', userIds)
        : { data: [] }

    const profileMap = new Map((profiles || []).map(p => [p.id, p]))

    const enriched = (data || []).map(p => ({
        ...p,
        user: profileMap.get(p.user_id) || {
            username: '用户',
            avatar_url: null
        }
    }))

    return {
        success: true,
        data: enriched,
        meta: {
            total: count,
            page,
            pageSize
        }
    }
})

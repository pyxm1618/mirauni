import { serverSupabaseClient } from '#supabase/server'
import { filterSampleProjects, isSampleProjectsAllowed } from '~/server/utils/sample-projects'

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
        // If role is passed, check if roles_needed contains it.
        // roles_needed is text[], so .contains should work.
        request = request.contains('roles_needed', [query.role])
    }

    if (query.work_mode) {
        request = request.eq('work_mode', query.work_mode)
    }

    if (query.keyword) {
        const kw = query.keyword
        // search title or summary
        request = request.or(`title.ilike.%${kw}%,summary.ilike.%${kw}%`)
    }

    // Pagination
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    request = request.range(from, to)

    const { data: rawData, error, count } = await request

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message
        })
    }

    // 内存过滤：绝不返回 id 以 demo- 开头的项目，防止生产数据库被脏注入
    const data = (rawData || []).filter((p: any) => !String(p.id).startsWith('demo-'))
    // 若过滤导致数量变化，则取过滤后的实际长度；否则使用数据库返回的 count
    const totalCount = (rawData || []).length === data.length ? (count ?? 0) : data.length

    // 冷启动兜底：当真实项目为空时，根据环境决定是否返回样板项目
    if (data.length === 0) {
        // 生产环境直接返回空，绝不展示样板项目
        if (!isSampleProjectsAllowed()) {
            return {
                success: true,
                data: [],
                meta: {
                    total: 0,
                    page,
                    pageSize
                }
            }
        }

        // 开发环境或显式允许时，返回样板项目 fallback
        const samples = filterSampleProjects({
            category: query.category ? String(query.category) : undefined,
            role: query.role ? String(query.role) : undefined,
            work_mode: query.work_mode ? String(query.work_mode) : undefined,
            keyword: query.keyword ? String(query.keyword) : undefined
        })
        const paged = samples.slice(from, to + 1)

        return {
            success: true,
            data: paged,
            meta: {
                total: samples.length,
                page,
                pageSize
            }
        }
    }

    // 内存合并 public_profiles 物理表中的公开用户信息，保证数据合规不越权
    const userIds = [...new Set(data.map(p => p.user_id).filter(Boolean))]

    const { data: profiles } = userIds.length
        ? await client
            .from('public_profiles')
            .select('id, username, avatar_url')
            .in('id', userIds)
        : { data: [] }

    const profileMap = new Map((profiles || []).map(p => [p.id, p]))

    const enriched = data.map(p => ({
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
            total: totalCount,
            page,
            pageSize
        }
    }
})


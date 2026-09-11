import { serverSupabaseClient } from '#supabase/server'
import { filterSampleProjects, isSampleProjectsAllowed } from '~/server/utils/sample-projects'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const client = await serverSupabaseClient(event)

    let request = client
        .from('mirauni_projects')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .order('curation_rank', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })

    if (query.listing_type) {
        request = request.eq('listing_type', query.listing_type)
    }

    if (query.industry) {
        request = request.eq('industry', query.industry)
    }

    if (query.category) {
        request = request.eq('category', query.category)
    }

    if (query.role) {
        request = request
            .eq('listing_type', 'owner')
            .eq('is_recruiting', true)
            .contains('roles_needed', [query.role])
    }

    if (query.work_mode) {
        request = request
            .eq('listing_type', 'owner')
            .eq('is_recruiting', true)
            .eq('work_mode', query.work_mode)
    }

    if (query.keyword) {
        const kw = String(query.keyword).replace(/[,%()]/g, ' ').trim()
        if (kw) request = request.or(`title.ilike.%${kw}%,summary.ilike.%${kw}%`)
    }

    const page = Math.max(1, parseInt(query.page as string) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize as string) || 30))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    request = request.range(from, to)

    const { data: rawData, error, count } = await request

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    const data = (rawData || []).filter((project: any) => !String(project.id).startsWith('demo-'))
    const totalCount = (rawData || []).length === data.length ? (count ?? 0) : data.length

    if (data.length === 0) {
        if (!isSampleProjectsAllowed()) {
            return { success: true, data: [], meta: { total: 0, page, pageSize } }
        }

        const samples = filterSampleProjects({
            category: query.category ? String(query.category) : undefined,
            role: query.role ? String(query.role) : undefined,
            work_mode: query.work_mode ? String(query.work_mode) : undefined,
            keyword: query.keyword ? String(query.keyword) : undefined
        })
        const paged = samples.slice(from, to + 1)
        return { success: true, data: paged, meta: { total: samples.length, page, pageSize } }
    }

    const ownerRows = data.filter((project: any) => project.listing_type !== 'curated')
    const userIds = [...new Set(ownerRows.map((project: any) => project.user_id).filter(Boolean))]

    const { data: profiles } = userIds.length
        ? await client
            .from('public_profiles')
            .select('id, username, avatar_url')
            .in('id', userIds)
        : { data: [] }

    const profileMap = new Map((profiles || []).map(profile => [profile.id, profile]))

    const enriched = data.map((project: any) => ({
        ...project,
        user: project.listing_type === 'curated'
            ? { id: project.user_id, username: '小概率精选', avatar_url: null }
            : (profileMap.get(project.user_id) || { id: project.user_id, username: '用户', avatar_url: null })
    }))

    return {
        success: true,
        data: enriched,
        meta: { total: totalCount, page, pageSize }
    }
})

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const supabase = await serverSupabaseClient(event)

    // Base query: select users who have filled in key profile info
    let request = supabase
        .from('users')
        .select('id, username, avatar_url, bio, profession, position, skills, experience_years, work_preference, location', { count: 'exact' })
        .not('username', 'is', null) // Only users with usernames (completed basic profile)
        .order('created_at', { ascending: false })

    // Dynamic filters

    // 1. Skill filter (array contains)
    if (query.skill) {
        // query.skill can be a string, we expect comma-separated or single value
        // But usually for single select filter it's a string. 
        // If we support multiple skills, we might need to handle array or comma split.
        // For now, assume single skill selection as per design doc.
        const skill = String(query.skill)
        if (skill) {
            request = request.contains('skills', [skill])
        }
    }

    // 2. Experience years range
    if (query.min_exp) {
        request = request.gte('experience_years', Number(query.min_exp))
    }
    if (query.max_exp) {
        request = request.lte('experience_years', Number(query.max_exp))
    }

    // 3. Work preference (exact match)
    if (query.work_preference) {
        request = request.eq('work_preference', String(query.work_preference))
    }

    // 4. Keyword search (ilike on username or bio)
    if (query.keyword) {
        const keyword = String(query.keyword)
        // Basic fuzzy search
        request = request.or(`username.ilike.%${keyword}%,bio.ilike.%${keyword}%,profession.ilike.%${keyword}%`)
    }

    // 5. Location search
    if (query.location) {
        const location = String(query.location)
        request = request.ilike('location', `%${location}%`)
    }

    // Pagination
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const from = (page - 1) * pageSize

    request = request.range(from, from + pageSize - 1)

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

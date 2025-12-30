import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const supabase = await serverSupabaseClient(event)

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!id || !uuidRegex.test(id)) {
        throw createError({
            statusCode: 404,
            message: '用户不存在'
        })
    }

    // Fetch public profile info by ID
    const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url, bio, profession, position, location, skills, experience_years, work_preference, social_links, created_at')
        .eq('id', id)
        .single()

    if (error) {
        throw createError({
            statusCode: error.code === 'PGRST116' ? 404 : 500,
            message: error.code === 'PGRST116' ? '用户不存在' : error.message
        })
    }

    return {
        success: true,
        data
    }
})

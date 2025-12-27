import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const username = getRouterParam(event, 'username')
    const supabase = await serverSupabaseClient(event)

    // Fetch public profile info by username
    const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url, bio, profession, position, location, skills, experience_years, work_preference, social_links, created_at')
        .eq('username', username)
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

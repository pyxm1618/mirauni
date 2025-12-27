import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event) // Optional

    // 1. Fetch Project + Author Public Info
    const { data: project, error } = await client
        .from('projects')
        .select(`
      *,
      users:user_id (
        id, username, avatar_url, bio,
        profession, position, location,
        skills, experience_years, work_preference
      )
    `)
        .eq('id', id)
        .single()

    if (error || !project) {
        throw createError({ statusCode: 404, message: 'Project not found' })
    }

    // 2. Determine Access (Is Owner? Is Unlocked?)
    let isOwner = false
    let isUnlocked = false

    if (user) {
        if (user.id === project.user_id) {
            isOwner = true
            isUnlocked = true // Owner sees all
        } else {
            // Check unlock record
            const { data: unlock } = await client
                .from('unlocks')
                .select('id')
                .eq('user_id', user.id)
                .eq('target_project_id', id)
                .single()

            if (unlock) isUnlocked = true
        }
    }

    // 3. Filter/Mask Data based on Visibility & Access
    // Project fields visibility (controlled by author)
    if (!project.description_visible && !isOwner) project.description = null
    if (!project.background_visible && !isOwner) project.background = null
    if (!project.vision_visible && !isOwner) project.vision = null
    if (!project.team_visible && !isOwner) project.team_info = null
    if (!project.demo_visible && !isOwner) project.demo_url = null

    // 4. Return Data
    return {
        success: true,
        data: {
            ...project,
            is_owner: isOwner,
            is_unlocked: isUnlocked
        }
    }
})

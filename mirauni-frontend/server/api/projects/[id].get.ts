import { serverSupabaseUser, serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { getSampleProjectById } from '~/server/utils/sample-projects'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (id) {
        const sample = getSampleProjectById(id)
        if (sample) {
            return {
                success: true,
                data: { ...sample, is_owner: false, is_unlocked: true }
            }
        }
    }

    const { data: project, error } = await client
        .from('mirauni_projects')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !project) {
        throw createError({ statusCode: 404, message: 'Project not found' })
    }

    const isOwner = Boolean(user && user.id === project.user_id)

    if (!isOwner && project.status !== 'active') {
        throw createError({ statusCode: 404, message: 'Project not found' })
    }

    if (project.listing_type === 'curated') {
        return {
            success: true,
            data: {
                ...project,
                users: {
                    id: project.user_id,
                    username: '小概率精选',
                    avatar_url: null
                },
                is_owner: false,
                is_unlocked: true
            }
        }
    }

    const { data: author } = await client
        .from('public_profiles')
        .select('id, username, avatar_url, bio, profession, position, location, skills, experience_years, work_preference, social_links, created_at')
        .eq('id', project.user_id)
        .single()

    project.users = author || {
        id: project.user_id,
        username: '未知用户'
    }

    let isUnlocked = false

    if (user) {
        if (isOwner) {
            isUnlocked = true
        } else if (project.is_recruiting) {
            const supabaseAdmin = serverSupabaseServiceRole(event)
            const { data: unlock } = await supabaseAdmin
                .from('unlocks')
                .select('id')
                .eq('user_id', user.id)
                .eq('target_user_id', project.user_id)
                .maybeSingle()

            if (unlock) isUnlocked = true
        }
    }

    if (!project.description_visible && !isOwner) project.description = null
    if (!project.background_visible && !isOwner) project.background = null
    if (!project.vision_visible && !isOwner) project.vision = null
    if (!project.team_visible && !isOwner) project.team_info = null
    if (!project.demo_visible && !isOwner) project.demo_url = null

    return {
        success: true,
        data: {
            ...project,
            is_owner: isOwner,
            is_unlocked: isUnlocked
        }
    }
})

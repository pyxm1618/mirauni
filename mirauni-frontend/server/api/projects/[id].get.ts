import { serverSupabaseUser, serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { getSampleProjectById } from '~/server/utils/sample-projects'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const client = await serverSupabaseClient(event)
    const supabaseAdmin = serverSupabaseServiceRole(event)
    const user = await serverSupabaseUser(event) // Optional

    // 冷启动样板项目详情
    if (id) {
        const sample = getSampleProjectById(id)
        if (sample) {
            return {
                success: true,
                data: {
                    ...sample,
                    is_owner: false,
                    is_unlocked: true
                }
            }
        }
    }

    // 1. Fetch Project
    const { data: project, error } = await client
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !project) {
        throw createError({ statusCode: 404, message: 'Project not found' })
    }

    // 2. Fetch Author Public Info from public_profiles physical table
    const { data: author } = await client
        .from('public_profiles')
        .select('id, username, avatar_url, bio, profession, position, location, skills, experience_years, work_preference, social_links, created_at')
        .eq('id', project.user_id)
        .single()

    // 拼装回原结构以保障模版及类型完全兼容
    project.users = author || {
        id: project.user_id,
        username: '未知用户'
    }

    // 3. Determine Access (Is Owner? Is Unlocked?)
    let isOwner = false
    let isUnlocked = false

    if (user) {
        if (user.id === project.user_id) {
            isOwner = true
            isUnlocked = true // Owner sees all
        } else {
            // Check user contact unlock record
            const { data: unlock } = await supabaseAdmin
                .from('unlocks')
                .select('id')
                .eq('user_id', user.id)
                .eq('target_user_id', project.user_id) // 修正解锁模型为“解锁作者联系方式”
                .single()

            if (unlock) isUnlocked = true
        }
    }

    // 4. Filter/Mask Data based strictly on Visibility (Decoupled from contact unlock!)
    // visibility 隐藏字段只有 Owner 本人才能无视，其他人（即使解锁了联系方式）依旧要受 visible 字段限制
    if (!project.description_visible && !isOwner) project.description = null
    if (!project.background_visible && !isOwner) project.background = null
    if (!project.vision_visible && !isOwner) project.vision = null
    if (!project.team_visible && !isOwner) project.team_info = null
    if (!project.demo_visible && !isOwner) project.demo_url = null

    // 5. Return Data
    return {
        success: true,
        data: {
            ...project,
            is_owner: isOwner,
            is_unlocked: isUnlocked
        }
    }
})

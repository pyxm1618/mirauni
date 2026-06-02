
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const client = serverSupabaseServiceRole(event)

    if (!user) {
        return { status: 'Not logged in' }
    }

    // 1. Check Auth User
    const authId = user.id

    // 2. Check Public User Profile
    const { data: publicUser, error: userError } = await client
        .from('users')
        .select('*')
        .eq('id', authId)
        .single()

    // 3. Check Projects
    const { data: projects, error: projectError } = await client
        .from('projects')
        .select('*')
        .eq('user_id', authId)

    // 4. Check All Projects (Sample)
    const { data: allProjects, count } = await client
        .from('projects')
        .select('id, title, user_id, status')
        .range(0, 5)

    return {
        auth: {
            id: authId,
            email: user.email
        },
        publicProfile: {
            exists: !!publicUser,
            data: publicUser,
            error: userError?.message
        },
        myProjects: {
            count: projects?.length,
            data: projects,
            error: projectError?.message
        },
        allProjectsSample: {
            data: allProjects,
            totalCount: count
        }
    }
})

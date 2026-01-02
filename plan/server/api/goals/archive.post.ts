import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    // Update active goal status to 'archived'
    const { error: goalError } = await client
        .from('goals')
        .update({ status: 'archived' })
        .eq('user_id', user.id)
        .eq('status', 'active')

    if (goalError) {
        throw createError({
            statusCode: 500,
            message: goalError.message
        })
    }

    // Cascade: Deactivate all projects for this user that are currently active
    // Ideally we should link via goal_id if projects have it, but for now user-level cleanup is safer for "Abandon Plan"
    // Assuming projects table has is_active field
    await client
        .from('projects')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true)

    return { success: true }
})

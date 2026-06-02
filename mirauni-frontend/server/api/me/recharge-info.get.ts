import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const supabaseAdmin = serverSupabaseServiceRole(event)

    // 1. 获取当前用户真实的 unlock_credits 余额
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('unlock_credits')
        .eq('id', user.id)
        .single()

    if (profileError) {
        throw createError({ statusCode: 500, message: 'Failed to fetch user credits' })
    }

    // 2. 获取用户累计解锁他人联系方式的次数
    const { count: lifetimeCount, error: countError } = await supabaseAdmin
        .from('unlocks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    if (countError) {
        throw createError({ statusCode: 500, message: 'Failed to fetch unlock statistics' })
    }

    // 3. 获取最近 20 条解锁记录，包含被解锁人的公开信息和关联项目
    const { data: history, error: historyError } = await supabaseAdmin
        .from('unlocks')
        .select(`
            id,
            created_at,
            target_user:target_user_id (
                id,
                username,
                avatar_url
            ),
            target_project:target_project_id (
                id,
                title
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    if (historyError) {
        throw createError({ statusCode: 500, message: 'Failed to fetch unlock history' })
    }

    return {
        success: true,
        data: {
            unlock_credits: profile.unlock_credits || 0,
            lifetime_unlocks: lifetimeCount || 0,
            history: history || []
        }
    }
})

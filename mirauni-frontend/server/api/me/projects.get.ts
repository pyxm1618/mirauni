
import { serverSupabaseUser, serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    // 尝试获取用户 ID，如果 session 中的 id 为空，则通过 email 查找
    let userId = user.id

    if (!userId && user.email) {
        // 使用 Admin API 通过 email 查找真实的 user ID
        const adminClient = serverSupabaseServiceRole(event)
        const { data: authData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 100 })
        const authUser = authData?.users?.find(u => u.email === user.email)
        if (authUser) {
            userId = authUser.id
        }
    }

    if (!userId) {
        throw createError({
            statusCode: 400,
            message: 'Unable to determine user ID'
        })
    }

    const client = await serverSupabaseClient(event)

    const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message
        })
    }

    return {
        success: true,
        data: data || []
    }
})

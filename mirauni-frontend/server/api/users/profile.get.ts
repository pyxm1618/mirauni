/**
 * 获取当前用户资料
 * GET /api/users/profile
 */
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: '请先登录'
        })
    }

    const supabase = await serverSupabaseClient(event)

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('获取用户资料失败:', error)
        throw createError({
            statusCode: 500,
            message: '获取资料失败'
        })
    }

    return {
        success: true,
        user: data
    }
})

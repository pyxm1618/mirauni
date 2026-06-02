/**
 * 封禁用户 API
 * POST /api/admin/users/[id]/ban
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const userId = getRouterParam(event, 'id')

    const supabase = createAdminSupabaseClient()

    const { error } = await supabase
        .from('users')
        .update({ status: 'banned' })
        .eq('id', userId)

    if (error) {
        throw createError({
            statusCode: 500,
            data: { code: 'DB_ERROR', message: error.message }
        })
    }

    return { success: true, message: '用户已封禁' }
})

/**
 * 文章列表 API (管理后台)
 * GET /api/admin/articles
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        throw createError({
            statusCode: 500,
            data: { code: 'DB_ERROR', message: error.message }
        })
    }

    return { success: true, data }
})

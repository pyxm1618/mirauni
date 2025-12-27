/**
 * 删除文章 API
 * DELETE /api/admin/articles/[id]
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const articleId = getRouterParam(event, 'id')

    const supabase = createAdminSupabaseClient()

    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId)

    if (error) {
        throw createError({
            statusCode: 500,
            data: { code: 'DB_ERROR', message: error.message }
        })
    }

    return { success: true, message: '文章已删除' }
})

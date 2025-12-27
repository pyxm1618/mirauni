/**
 * 创建文章 API
 * POST /api/admin/articles
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    const admin = await requireAdmin(event)
    const body = await readBody(event)

    const { title, slug, summary, content, category, status } = body

    if (!title || !slug) {
        throw createError({
            statusCode: 400,
            data: { code: 'VALIDATION_ERROR', message: '标题和 Slug 必填' }
        })
    }

    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
        .from('articles')
        .insert({
            title,
            slug,
            summary: summary || '',
            content: content || '',
            category: category || 'tutorial',
            status: status || 'draft',
            author_id: admin.id
        })
        .select()
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            data: { code: 'DB_ERROR', message: error.message }
        })
    }

    return { success: true, data }
})

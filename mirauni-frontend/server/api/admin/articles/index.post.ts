/**
 * 创建文章 API
 * POST /api/admin/articles
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'
import { enqueueSeoUrl } from '~/server/utils/seo-push-queue'

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

    if (data.status === 'published') {
        const config = useRuntimeConfig()
        const siteUrl = (config.public.siteUrl || 'https://mirauni.com').replace(/\/+$/, '')
        try {
            const result = await enqueueSeoUrl({
                url: `${siteUrl}/academy/${data.slug}`,
                type: 'article',
                sourceId: data.id
            })
            if (!result.success) {
                console.warn('文章入队百度推送失败:', result.error)
            }
        } catch (e: any) {
            console.warn('文章入队百度推送发生异常:', e)
        }
    }

    return { success: true, data }
})

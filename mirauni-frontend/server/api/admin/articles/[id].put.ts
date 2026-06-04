/**
 * 更新文章 API
 * PUT /api/admin/articles/[id]
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'
import { enqueueSeoUrl } from '~/server/utils/seo-push-queue'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const articleId = getRouterParam(event, 'id')
    const body = await readBody(event)

    const { title, slug, summary, content, category, status } = body

    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
        .from('articles')
        .update({
            title,
            slug,
            summary,
            content,
            category,
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', articleId)
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

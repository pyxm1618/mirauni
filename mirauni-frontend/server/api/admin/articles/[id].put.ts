/**
 * 更新文章 API
 * PUT /api/admin/articles/[id]
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'
import { pushUrlsToBaidu } from '~/server/utils/baidu-push'

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
        await pushUrlsToBaidu([`${siteUrl}/academy/${data.slug}`])
    }

    return { success: true, data }
})

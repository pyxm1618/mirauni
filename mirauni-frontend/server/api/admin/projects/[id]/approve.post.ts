/**
 * 审核通过项目 API
 * POST /api/admin/projects/[id]/approve
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'
import { enqueueSeoUrl } from '~/server/utils/seo-push-queue'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const projectId = getRouterParam(event, 'id')

    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
        .from('mirauni_projects')
        .update({ status: 'active' })
        .eq('id', projectId)
        .select('id')

    if (error) {
        throw createError({
            statusCode: 500,
            data: { code: 'DB_ERROR', message: error.message }
        })
    }

    if (!data || data.length === 0) {
        throw createError({
            statusCode: 404,
            message: '项目不存在'
        })
    }

    // 获取 siteUrl 并将项目 URL 写入百度推送队列
    const config = useRuntimeConfig()
    const siteUrl = (config.public.siteUrl || 'https://mirauni.com').replace(/\/+$/, '')

    try {
        const enqueueResult = await enqueueSeoUrl({
            url: `${siteUrl}/projects/${projectId}`,
            type: 'project',
            sourceId: projectId
        })
        if (!enqueueResult.success) {
            console.warn('Baidu push queue enqueue warning during project approve:', enqueueResult.error)
        } else {
            console.log('Baidu push queue enqueue success during project approve:', enqueueResult.alreadyExists ? 'Already exists' : 'Enqueued')
        }
    } catch (enqueueErr: any) {
        console.warn('Baidu push queue enqueue failed during project approve:', enqueueErr?.message || enqueueErr)
    }

    return { success: true, message: '项目已审核通过' }
})

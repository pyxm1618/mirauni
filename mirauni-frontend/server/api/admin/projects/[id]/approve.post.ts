/**
 * 审核通过项目 API
 * POST /api/admin/projects/[id]/approve
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'
import { pushUrlsToBaidu } from '~/server/utils/baidu-push'

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

    // 获取 siteUrl 并推送百度
    const config = useRuntimeConfig()
    const siteUrl = (config.public.siteUrl || 'https://mirauni.com').replace(/\/+$/, '')

    try {
        const pushResult = await pushUrlsToBaidu([`${siteUrl}/projects/${projectId}`])
        if (!pushResult.success) {
            console.warn('Baidu push warning during project approve:', pushResult.error)
        } else {
            console.log('Baidu push success during project approve:', pushResult.data)
        }
    } catch (pushErr: any) {
        console.error('Baidu push failed during project approve:', pushErr?.message || pushErr)
    }

    return { success: true, message: '项目已审核通过' }
})

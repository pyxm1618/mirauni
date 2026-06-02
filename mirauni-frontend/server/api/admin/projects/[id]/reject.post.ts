/**
 * 审核拒绝项目 API
 * POST /api/admin/projects/[id]/reject
 */
import { requireAdmin, createAdminSupabaseClient } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const projectId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const reason = body?.reason || ''

    const supabase = createAdminSupabaseClient()

    const { error } = await supabase
        .from('projects')
        .update({
            status: 'rejected',
            reject_reason: reason
        })
        .eq('id', projectId)

    if (error) {
        throw createError({
            statusCode: 500,
            data: { code: 'DB_ERROR', message: error.message }
        })
    }

    return { success: true, message: '项目已拒绝' }
})

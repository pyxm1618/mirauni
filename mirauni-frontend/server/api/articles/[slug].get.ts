
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { getSampleArticleBySlug } from '~/server/utils/sample-articles'
import { getAdminFromEvent } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event) // Optional

    const { data, error } = await client
        .from('articles')
        .select('*, author:users!author_id(username, avatar_url)')
        .eq('slug', slug)
        .maybeSingle()

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message
        })
    }

    // 鉴权判断
    let isOwner = false
    let isAdmin = false
    if (user && data) {
        if (user.id === data.author_id) {
            isOwner = true
        }
    }
    const admin = await getAdminFromEvent(event)
    if (admin) {
        isAdmin = true
    }

    // 状态边界拦截：如果文章处于 draft 状态，非作者且非管理员访问直接返回 404
    if (data && data.status === 'draft') {
        if (!isOwner && !isAdmin) {
            throw createError({
                statusCode: 404,
                message: 'Article not found'
            })
        }
    }

    if (!data) {
        const sample = getSampleArticleBySlug(String(slug || ''))
        if (!sample) {
            throw createError({
                statusCode: 404,
                message: 'Article not found'
            })
        }
        if (sample.status !== 'published' && !isOwner && !isAdmin) {
            throw createError({
                statusCode: 404,
                message: 'Article not found'
            })
        }
        return {
            success: true,
            data: sample
        }
    }

    return {
        success: true,
        data
    }
})

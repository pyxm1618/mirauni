import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const { event_name, event_params, page_url, referrer } = body

    if (!event_name) {
        throw createError({
            statusCode: 400,
            message: '缺少 event_name 参数'
        })
    }

    // 使用 service role 写入，绕过 RLS
    const supabase = await serverSupabaseServiceRole(event)

    // 获取用户 ID（如果已登录）
    let userId = null
    try {
        const authHeader = getHeader(event, 'authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const { data: { user } } = await supabase.auth.getUser(token)
            userId = user?.id
        }
    } catch (e) {
        // 忽略认证错误，允许匿名埋点
    }

    // 获取客户端信息
    const userAgent = getHeader(event, 'user-agent') || ''
    const forwardedFor = getHeader(event, 'x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : ''

    try {
        const { error } = await supabase.from('events').insert({
            user_id: userId,
            event_name,
            event_params: event_params || {},
            page_url: page_url || '',
            referrer: referrer || '',
            user_agent: userAgent,
            ip
        })

        if (error) {
            console.error('[Track] Insert failed:', error)
            throw createError({
                statusCode: 500,
                message: '埋点数据保存失败'
            })
        }

        return { success: true }
    } catch (error: any) {
        console.error('[Track] Error:', error)
        throw createError({
            statusCode: 500,
            message: error.message || '埋点失败'
        })
    }
})

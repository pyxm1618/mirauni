import crypto from 'crypto'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { event_name, event_params, page_url, referrer } = body

    // 1. 字段非空与基础白名单校验
    if (!event_name || typeof event_name !== 'string') {
        throw createError({
            statusCode: 400,
            message: '缺少 event_name 参数'
        })
    }

    const config = useRuntimeConfig()
    const secret = config.ipHashSecret

    // 生产环境缺少 IP_HASH_SECRET 直接报错，保障合规底线
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw createError({
                statusCode: 500,
                message: 'IP_HASH_SECRET is required in production!'
            })
        }
    }

    const salt = secret || 'mirauni_fallback_ip_salt_key_2026'

    // 2. 字段严格长度截断防止被刷超长文本攻击
    const safeEventName = event_name.slice(0, 100)
    const safePageUrl = (page_url && typeof page_url === 'string') ? page_url.slice(0, 2048) : ''
    const safeReferrer = (referrer && typeof referrer === 'string') ? referrer.slice(0, 2048) : ''
    const rawUserAgent = getHeader(event, 'user-agent') || ''
    const safeUserAgent = rawUserAgent.slice(0, 1024)

    // 3. 获取客户端 IP 并进行 HMAC-SHA256 脱敏
    const forwardedFor = getHeader(event, 'x-forwarded-for')
    const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'
    const ipHash = crypto.createHmac('sha256', salt).update(rawIp).digest('hex')

    // 使用 service role 操作以绕过 RLS 写入限制
    const supabase = await serverSupabaseServiceRole(event)

    // 4. 获取当前已登录的用户 ID (如果有)
    let userId = null
    try {
        const authHeader = getHeader(event, 'authorization')
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const { data: { user } } = await supabase.auth.getUser(token)
            userId = user?.id || null
        }
    } catch (e) {
        // 忽略认证异常，允许匿名游客埋点
    }

    // 5. 基于高吞吐复合索引的数据库快速限流防刷统计 (最近 1 分钟 QPS > 60 则直接拒绝)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    
    // 利用我们物理创建的复合索引进行毫秒级极速统计
    const { count: ipWriteCount, error: limitError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', oneMinuteAgo)

    if (limitError) {
         console.error('[Track] Rate limit query error:', limitError)
    }

    if ((ipWriteCount || 0) >= 60) {
        throw createError({
            statusCode: 429,
            message: '请求过于频繁'
        })
    }

    // 6. 安全插入埋点记录
    try {
        const { error } = await supabase.from('events').insert({
            user_id: userId,
            event_name: safeEventName,
            event_params: event_params || {},
            page_url: safePageUrl,
            referrer: safeReferrer,
            user_agent: safeUserAgent,
            ip_hash: ipHash
        })

        if (error) {
            console.error('[Track] Insert failed:', error)
            throw createError({
                statusCode: 500,
                message: '数据保存失败'
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

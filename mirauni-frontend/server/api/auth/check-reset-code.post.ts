/**
 * 校验重置密码验证码有效性接口 (仅预检, 不删除)
 * POST /api/auth/check-reset-code
 * Body: { phone: string, code: string }
 */
import { serverSupabaseServiceRole } from '#supabase/server'
import { getRequestIP } from 'h3'

interface RateLimitRecord {
    attempts: number
    lockUntil: number
}

// 内存限频缓存
const rateLimitMap = new Map<string, RateLimitRecord>()

// 清理缓存以防溢出
function cleanupCache() {
    if (rateLimitMap.size > 10000) {
        rateLimitMap.clear()
    }
}

export default defineEventHandler(async (event) => {
    const { phone, code } = await readBody(event)

    // 1. 校验手机号格式 (防暴力输入)
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        throw createError({
            statusCode: 400,
            message: '验证码错误或已过期'
        })
    }

    // 2. 校验验证码格式 (防暴破尝试)
    if (!code || !/^\d{6}$/.test(code)) {
        throw createError({
            statusCode: 400,
            message: '验证码错误或已过期'
        })
    }

    // 3. 校验频率限制 (双重限流：联合维度限频 + 单IP扫号限频)
    const ip = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
    const now = Date.now()
    cleanupCache()

    // A. 联合维度 (phone + ip) 限制：5分钟内最多 5 次
    const limitKeyUnion = `${phone}_${ip}`
    const recordUnion = rateLimitMap.get(limitKeyUnion) || { attempts: 0, lockUntil: 0 }

    if (recordUnion.lockUntil > now) {
        const remainingMinutes = Math.ceil((recordUnion.lockUntil - now) / 60000)
        throw createError({
            statusCode: 429,
            message: `尝试次数过多，请在 ${remainingMinutes} 分钟后再试`
        })
    }

    // B. 单 IP 维度限制 (防止单IP扫号爆破)：5分钟内最多 15 次
    const limitKeyIp = `ip_${ip}`
    const recordIp = rateLimitMap.get(limitKeyIp) || { attempts: 0, lockUntil: 0 }

    if (recordIp.lockUntil > now) {
        const remainingMinutes = Math.ceil((recordIp.lockUntil - now) / 60000)
        throw createError({
            statusCode: 429,
            message: `请求过于频繁，请在 ${remainingMinutes} 分钟后再试`
        })
    }

    const supabaseAdmin = serverSupabaseServiceRole(event)

    // 开发模式支持万能验证码
    const isDevMasterCode = process.dev && code === '888888'
    let isSuccess = false

    if (isDevMasterCode) {
        isSuccess = true
    } else {
        const { data: smsData, error: smsError } = await supabaseAdmin
            .from('sms_codes')
            .select()
            .eq('phone', phone)
            .eq('code', code)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle()

        isSuccess = !smsError && !!smsData
    }

    if (!isSuccess) {
        // 联合维度累加
        recordUnion.attempts += 1
        if (recordUnion.attempts >= 5) {
            recordUnion.lockUntil = now + 5 * 60 * 1000 // 锁定5分钟
        }
        rateLimitMap.set(limitKeyUnion, recordUnion)

        // IP 维度累加
        recordIp.attempts += 1
        if (recordIp.attempts >= 15) {
            recordIp.lockUntil = now + 5 * 60 * 1000 // 锁定5分钟
        }
        rateLimitMap.set(limitKeyIp, recordIp)

        if (recordUnion.attempts >= 5 || recordIp.attempts >= 15) {
            throw createError({
                statusCode: 429,
                message: '尝试次数过多，请 5 分钟后再试'
            })
        }

        throw createError({
            statusCode: 400,
            message: '验证码错误或已过期'
        })
    }

    // 校验成功，清空当前联合维度的错误计数
    rateLimitMap.delete(limitKeyUnion)

    return {
        success: true,
        message: '验证码验证通过'
    }
})

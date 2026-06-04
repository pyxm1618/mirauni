/**
 * 重置密码验证码频率限制 Utility Helper
 */

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

/**
 * 校验频率限制 (双重限频)
 * @param phone 手机号
 * @param ip 客户端 IP
 */
export function checkResetCodeRateLimit(phone: string, ip: string) {
    const now = Date.now()
    cleanupCache()

    // A. 联合维度 (phone + ip) 限制：5分钟内最多 5 次
    const limitKeyUnion = `${phone}_${ip}`
    const recordUnion = rateLimitMap.get(limitKeyUnion)

    if (recordUnion && recordUnion.lockUntil > now) {
        const remainingMinutes = Math.ceil((recordUnion.lockUntil - now) / 60000)
        throw createError({
            statusCode: 429,
            message: `尝试次数过多，请在 ${remainingMinutes} 分钟后再试`
        })
    }

    // B. 单 IP 维度限制 (防止单IP扫号爆破)：5分钟内最多 15 次
    const limitKeyIp = `ip_${ip}`
    const recordIp = rateLimitMap.get(limitKeyIp)

    if (recordIp && recordIp.lockUntil > now) {
        const remainingMinutes = Math.ceil((recordIp.lockUntil - now) / 60000)
        throw createError({
            statusCode: 429,
            message: `请求过于频繁，请在 ${remainingMinutes} 分钟后再试`
        })
    }
}

/**
 * 增加尝试次数。在验证码校验失败时调用。
 * @param phone 手机号
 * @param ip 客户端 IP
 */
export function incrementResetCodeAttempts(phone: string, ip: string) {
    const now = Date.now()
    cleanupCache()

    const limitKeyUnion = `${phone}_${ip}`
    const recordUnion = rateLimitMap.get(limitKeyUnion) || { attempts: 0, lockUntil: 0 }

    const limitKeyIp = `ip_${ip}`
    const recordIp = rateLimitMap.get(limitKeyIp) || { attempts: 0, lockUntil: 0 }

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

/**
 * 校验成功时，清空当前联合维度的错误计数
 * @param phone 手机号
 * @param ip 客户端 IP
 */
export function clearResetCodeAttempts(phone: string, ip: string) {
    const limitKeyUnion = `${phone}_${ip}`
    rateLimitMap.delete(limitKeyUnion)
}

/**
 * 校验验证码登录的频率限制 (双重限频)
 * @param phone 手机号
 * @param ip 客户端 IP
 */
export function checkVerifyCodeRateLimit(phone: string, ip: string) {
    const now = Date.now()
    cleanupCache()

    // A. 联合维度 (phone + ip) 限制：5分钟内最多 5 次
    const limitKeyUnion = `v_${phone}_${ip}`
    const recordUnion = rateLimitMap.get(limitKeyUnion)

    if (recordUnion && recordUnion.lockUntil > now) {
        const remainingMinutes = Math.ceil((recordUnion.lockUntil - now) / 60000)
        throw createError({
            statusCode: 429,
            message: `尝试次数过多，请在 ${remainingMinutes} 分钟后再试`
        })
    }

    // B. 单 IP 维度限制 (防止单IP扫号爆破)：5分钟内最多 15 次
    const limitKeyIp = `v_ip_${ip}`
    const recordIp = rateLimitMap.get(limitKeyIp)

    if (recordIp && recordIp.lockUntil > now) {
        const remainingMinutes = Math.ceil((recordIp.lockUntil - now) / 60000)
        throw createError({
            statusCode: 429,
            message: `请求过于频繁，请在 ${remainingMinutes} 分钟后再试`
        })
    }
}

/**
 * 增加验证码登录尝试次数。在验证码校验失败时调用。
 * @param phone 手机号
 * @param ip 客户端 IP
 */
export function incrementVerifyCodeAttempts(phone: string, ip: string) {
    const now = Date.now()
    cleanupCache()

    const limitKeyUnion = `v_${phone}_${ip}`
    const recordUnion = rateLimitMap.get(limitKeyUnion) || { attempts: 0, lockUntil: 0 }

    const limitKeyIp = `v_ip_${ip}`
    const recordIp = rateLimitMap.get(limitKeyIp) || { attempts: 0, lockUntil: 0 }

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

/**
 * 校验成功时，清空当前验证码登录的联合维度的错误计数
 * @param phone 手机号
 * @param ip 客户端 IP
 */
export function clearVerifyCodeAttempts(phone: string, ip: string) {
    const limitKeyUnion = `v_${phone}_${ip}`
    rateLimitMap.delete(limitKeyUnion)
}

import crypto from 'crypto'

export const WECHAT_OAUTH_STATE_TTL_SECONDS = 10 * 60

function signStatePayload(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createWechatOAuthState(secret: string, nowMs = Date.now()): string {
    const timestamp = Math.floor(nowMs / 1000).toString(36)
    const nonce = crypto.randomBytes(32).toString('base64url')
    const payload = `${timestamp}.${nonce}`
    return `${payload}.${signStatePayload(payload, secret)}`
}

export function verifyWechatOAuthState(
    state: string,
    secret: string,
    nowMs = Date.now(),
    ttlSeconds = WECHAT_OAUTH_STATE_TTL_SECONDS
): boolean {
    const parts = state.split('.')
    if (parts.length !== 3) return false

    const [timestampPart, nonce, signature] = parts
    if (!timestampPart || !nonce || !signature) return false

    const timestampSeconds = Number.parseInt(timestampPart, 36)
    if (!Number.isFinite(timestampSeconds)) return false

    const nowSeconds = Math.floor(nowMs / 1000)
    const ageSeconds = nowSeconds - timestampSeconds
    if (ageSeconds < 0 || ageSeconds > ttlSeconds) return false

    const payload = `${timestampPart}.${nonce}`
    const expectedSignature = signStatePayload(payload, secret)
    const actualBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)

    if (actualBuffer.length !== expectedBuffer.length) return false
    return crypto.timingSafeEqual(actualBuffer, expectedBuffer)
}

export function oauthStatesMatch(actual: string, expected: string): boolean {
    const actualBuffer = Buffer.from(actual)
    const expectedBuffer = Buffer.from(expected)
    if (actualBuffer.length !== expectedBuffer.length) return false
    return crypto.timingSafeEqual(actualBuffer, expectedBuffer)
}

export function normalizeInternalRedirect(value: unknown): string {
    if (typeof value !== 'string' || !value) return '/'

    let decoded: string
    try {
        decoded = decodeURIComponent(value)
    } catch {
        return '/'
    }

    if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.includes('\\')) {
        return '/'
    }

    try {
        const base = new URL('https://mirauni.invalid')
        const parsed = new URL(decoded, base)
        if (parsed.origin !== base.origin) return '/'
        return `${parsed.pathname}${parsed.search}${parsed.hash}`
    } catch {
        return '/'
    }
}

/**
 * 获取微信登录 URL
 * GET /api/auth/wechat/url
 * Query: { type?: 'pc' | 'h5', redirect?: string }
 */
import { getWechatQRLoginUrl, getWechatH5AuthUrl, isWechatBrowser } from '~/server/utils/wechat'
import {
    createWechatOAuthState,
    normalizeInternalRedirect,
    WECHAT_OAUTH_STATE_TTL_SECONDS
} from '~/server/utils/wechat-oauth-state'

const STATE_COOKIE = 'mirauni_wechat_oauth_state'
const REDIRECT_COOKIE = 'mirauni_wechat_oauth_redirect'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const headers = getHeaders(event)

    if (!config.wechatAppId) {
        throw createError({
            statusCode: 503,
            message: '微信登录暂不可用'
        })
    }

    const stateSecret = process.env.JWT_SECRET || (process.dev ? 'dev-only-wechat-oauth-state-secret' : '')
    if (!stateSecret) {
        throw createError({
            statusCode: 503,
            message: '微信登录暂不可用'
        })
    }

    const baseUrl = config.public.siteUrl || 'https://mirauni.com'
    const redirectUri = `${baseUrl}/api/auth/wechat/callback`
    const state = createWechatOAuthState(stateSecret)
    const redirect = normalizeInternalRedirect(query.redirect)

    const cookieOptions = {
        httpOnly: true,
        secure: !process.dev,
        sameSite: 'lax' as const,
        path: '/api/auth/wechat',
        maxAge: WECHAT_OAUTH_STATE_TTL_SECONDS
    }

    setCookie(event, STATE_COOKIE, state, cookieOptions)
    setCookie(event, REDIRECT_COOKIE, redirect, cookieOptions)

    const userAgent = headers['user-agent'] || ''
    const isH5 = query.type === 'h5' || isWechatBrowser(userAgent)

    const url = isH5
        ? getWechatH5AuthUrl(encodeURIComponent(redirectUri), state)
        : getWechatQRLoginUrl(encodeURIComponent(redirectUri), state)

    return {
        success: true,
        url,
        type: isH5 ? 'h5' : 'pc'
    }
})

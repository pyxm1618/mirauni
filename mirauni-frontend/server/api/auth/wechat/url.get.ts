/**
 * 获取微信登录 URL
 * GET /api/auth/wechat/url
 * Query: { type?: 'pc' | 'h5' }  默认根据 UA 自动判断
 */
import { getWechatQRLoginUrl, getWechatH5AuthUrl, isWechatBrowser } from '~/server/utils/wechat'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const headers = getHeaders(event)

    // 检查微信配置
    if (!config.wechatAppId) {
        throw createError({
            statusCode: 503,
            message: '微信登录暂不可用'
        })
    }

    // 生成回调 URL
    const baseUrl = config.public.siteUrl || 'https://mirauni.com'
    const redirectUri = `${baseUrl}/api/auth/wechat/callback`

    // 生成 state（用于防止 CSRF）
    const state = Math.random().toString(36).slice(2, 12)

    // 判断登录类型
    const userAgent = headers['user-agent'] || ''
    const isH5 = query.type === 'h5' || isWechatBrowser(userAgent)

    let url: string

    if (isH5) {
        // 微信 H5 授权登录
        url = getWechatH5AuthUrl(encodeURIComponent(redirectUri), state)
    } else {
        // PC 扫码登录
        url = getWechatQRLoginUrl(encodeURIComponent(redirectUri), state)
    }

    return {
        success: true,
        url,
        type: isH5 ? 'h5' : 'pc'
    }
})


import { getWechatQRLoginUrl, getWechatH5AuthUrl, isWechatBrowser } from '~/server/utils/wechat'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const headers = getHeaders(event)

    // 检查微信配置
    if (!config.wechatAppId) {
        throw createError({
            statusCode: 503,
            message: '微信登录暂不可用 (未配置 AppID)'
        })
    }

    // 生成回调 URL (本应用的回调)
    // 假设本应用部署在 plan.mirauni.com 或者 localhost
    // 如果是 localhost，微信回调会失败，除非配置了 hosts 或者 dev tunnel
    const baseUrl = config.public.siteUrl || 'http://localhost:3001' 
    const redirectUri = `${baseUrl}/api/auth/wechat/callback`

    // 生成 state
    const state = Math.random().toString(36).slice(2, 12)

    // 判断登录类型
    const userAgent = headers['user-agent'] || ''
    const isH5 = query.type === 'h5' || isWechatBrowser(userAgent)

    let url: string

    if (isH5) {
        url = getWechatH5AuthUrl(encodeURIComponent(redirectUri), state)
    } else {
        url = getWechatQRLoginUrl(encodeURIComponent(redirectUri), state)
    }

    return {
        success: true,
        url,
        type: isH5 ? 'h5' : 'pc'
    }
})

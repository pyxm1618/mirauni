
export const unifiedOrderUrl = 'https://api.mch.weixin.qq.com/pay/unifiedorder'

// 微信开放平台：用 code 换取 access_token
export async function getWechatAccessToken(code: string): Promise<{
    access_token: string
    expires_in: number
    refresh_token: string
    openid: string
    scope: string
    unionid?: string
}> {
    const config = useRuntimeConfig()
    // 注意：这里读取的是服务端的 wechatAppId，需要在 nuxt.config.ts 或 .env 中配置
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.wechatAppId}&secret=${config.wechatAppSecret}&code=${code}&grant_type=authorization_code`

    console.log('[微信API] 请求 access_token')

    const response = await $fetch<any>(url)
    const data = typeof response === 'string' ? JSON.parse(response) : response

    if (data.errcode) {
        throw new Error(`微信授权失败: ${data.errmsg}`)
    }

    return data
}

// 微信开放平台：获取用户信息
export async function getWechatUserInfo(accessToken: string, openid: string): Promise<{
    openid: string
    nickname: string
    sex: number
    province: string
    city: string
    country: string
    headimgurl: string
    privilege: string[]
    unionid?: string
}> {
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`

    const response = await $fetch<any>(url)
    const data = typeof response === 'string' ? JSON.parse(response) : response

    if (data.errcode) {
        throw new Error(`获取用户信息失败: ${data.errmsg}`)
    }

    return data
}

// 判断是否在微信浏览器中
export function isWechatBrowser(userAgent: string): boolean {
    return /MicroMessenger/i.test(userAgent)
}

// 微信开放平台：PC 扫码登录 URL
export function getWechatQRLoginUrl(redirectUri: string, state: string): string {
    const config = useRuntimeConfig()
    return `https://open.weixin.qq.com/connect/qrconnect?appid=${config.wechatAppId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`
}

// 微信公众号：H5 授权登录 URL
export function getWechatH5AuthUrl(redirectUri: string, state: string): string {
    const config = useRuntimeConfig()
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.wechatAppId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`
}

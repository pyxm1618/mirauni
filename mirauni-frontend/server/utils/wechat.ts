import crypto from 'crypto'
import { parseString, Builder } from 'xml2js'

export const unifiedOrderUrl = 'https://api.mch.weixin.qq.com/pay/unifiedorder'

// MD5 Signature (WeChat Pay V2)
export function sign(params: Record<string, any>, key: string): string {
    const sortedKeys = Object.keys(params).sort()
    let str = ''
    for (const k of sortedKeys) {
        if (params[k] && params[k] !== '') {
            str += `${k}=${params[k]}&`
        }
    }
    str += `key=${key}`
    return crypto.createHash('md5').update(str).digest('hex').toUpperCase()
}

// XML to JSON
export function parseXml(xml: string): Promise<any> {
    return new Promise((resolve, reject) => {
        parseString(xml, { explicitArray: false }, (err, result) => {
            if (err) reject(err)
            else resolve(result ? result.xml : {})
        })
    })
}

// JSON to XML
export function buildXml(obj: Record<string, any>): string {
    const builder = new Builder({ rootName: 'xml', headless: true, renderOpts: { pretty: false } })
    return builder.buildObject(obj)
}

// Generate Random String
export function generateNonceStr(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let str = ''
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return str
}

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
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.wechatAppId}&secret=${config.wechatAppSecret}&code=${code}&grant_type=authorization_code`

    console.log('[微信API] 请求 access_token')
    console.log('[微信API] AppID:', config.wechatAppId)
    console.log('[微信API] Code:', code ? code.substring(0, 10) + '...' : 'undefined')

    const response = await $fetch<any>(url)

    // 输出完整响应用于调试
    console.log('[微信API] access_token 完整响应:', JSON.stringify(response, null, 2))

    if (response.errcode) {
        throw new Error(`微信授权失败: ${response.errmsg}`)
    }

    console.log('[微信API] 准备返回，openid:', response.openid, 'access_token 前20位:', response.access_token?.substring(0, 20))

    return response
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

    console.log('[微信API] 请求用户信息')
    console.log('[微信API] access_token:', accessToken ? accessToken.substring(0, 20) + '...' : 'undefined')
    console.log('[微信API] openid:', openid)

    const response = await $fetch<any>(url)

    // 输出完整响应用于调试
    console.log('[微信API] 用户信息完整响应:', JSON.stringify(response, null, 2))

    if (response.errcode) {
        throw new Error(`获取用户信息失败: ${response.errmsg}`)
    }

    return response
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

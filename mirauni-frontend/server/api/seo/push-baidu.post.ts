import { requireAdmin } from '~/server/utils/admin-auth'
import { pushUrlsToBaidu } from '~/server/utils/baidu-push'

export default defineEventHandler(async (event) => {
    // 1. 鉴权：仅管理员允许访问
    await requireAdmin(event)

    const { urls } = await readBody(event)

    // 2. 校验 urls 是否是数组，且不为空
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        throw createError({
            statusCode: 400,
            message: '请提供有效的URL列表'
        })
    }

    // 3. 校验每次最多允许 20 个 URL
    if (urls.length > 20) {
        throw createError({
            statusCode: 400,
            message: '每次最多允许推送20个URL'
        })
    }

    // 4. 校验 URL 前缀及域名安全性
    const config = useRuntimeConfig()
    const siteUrl = (config.public.siteUrl || 'https://mirauni.com').replace(/\/+$/, '')

    for (const u of urls) {
        if (typeof u !== 'string') {
            throw createError({
                statusCode: 400,
                message: 'URL必须是字符串格式'
            })
        }

        if (!u.startsWith(siteUrl)) {
            throw createError({
                statusCode: 400,
                message: `URL必须以站点配置前缀 ${siteUrl} 开始`
            })
        }

        try {
            const parsedUrl = new URL(u)
            const hostname = parsedUrl.hostname
            // 确保 hostname 是 mirauni.com 或其子域名
            if (hostname !== 'mirauni.com' && !hostname.endsWith('.mirauni.com')) {
                throw createError({
                    statusCode: 400,
                    message: '禁止推送非 mirauni.com 域名的 URL'
                })
            }
        } catch (err: any) {
            throw createError({
                statusCode: 400,
                message: err.message || '无效的URL格式'
            })
        }
    }

    const result = await pushUrlsToBaidu(urls)
    if (!result.success) {
        throw createError({
            statusCode: 500,
            message: `百度推送失败: ${result.error || '未知错误'}`
        })
    }

    return {
        success: true,
        data: result.data
    }
})

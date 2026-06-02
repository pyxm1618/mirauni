import { pushUrlsToBaidu } from '~/server/utils/baidu-push'

export default defineEventHandler(async (event) => {
    const { urls } = await readBody(event)

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        throw createError({
            statusCode: 400,
            message: '请提供有效的URL列表'
        })
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

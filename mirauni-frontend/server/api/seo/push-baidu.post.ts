export default defineEventHandler(async (event) => {
    const { urls } = await readBody(event)
    const config = useRuntimeConfig()
    const token = config.baiduPushToken

    if (!token) {
        throw createError({
            statusCode: 500,
            message: '百度推送令牌未配置'
        })
    }

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        throw createError({
            statusCode: 400,
            message: '请提供有效的URL列表'
        })
    }

    try {
        // 百度站长平台主动推送 API
        const response = await $fetch(
            `http://data.zz.baidu.com/urls?site=https://www.mirauni.com&token=${token}`,
            {
                method: 'POST',
                body: urls.join('\n'),
                headers: {
                    'Content-Type': 'text/plain'
                }
            }
        )

        console.log('[Baidu Push] Success:', response)

        return {
            success: true,
            data: response
        }
    } catch (error: any) {
        console.error('[Baidu Push] Failed:', error)

        throw createError({
            statusCode: 500,
            message: `百度推送失败: ${error.message || '未知错误'}`
        })
    }
})

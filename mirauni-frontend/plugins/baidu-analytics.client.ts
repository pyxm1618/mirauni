export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const analyticsId = config.public.baiduAnalyticsId

    if (!analyticsId) {
        console.warn('[Baidu Analytics] ID not configured, skipping...')
        return
    }

    // 创建百度统计脚本
    const script = document.createElement('script')
    script.async = true
    script.src = `https://hm.baidu.com/hm.js?${analyticsId}`

    // 添加到页面
    const firstScript = document.getElementsByTagName('script')[0]
    if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript)
    } else {
        document.head.appendChild(script)
    }

    // 初始化 _hmt 数组（百度统计需要）
    ; (window as any)._hmt = (window as any)._hmt || []

    console.log('[Baidu Analytics] Loaded successfully')
})

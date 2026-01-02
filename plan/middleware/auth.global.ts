export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()
    const runtimeConfig = useRuntimeConfig()

    // 1. 放行公开的契约页面 /p/*（优先级最高）
    if (to.path.startsWith('/p/')) {
        return
    }

    // 2. 首页 / 对所有用户公开（落地页）
    if (to.path === '/') {
        return
    }

    // 3. 处理其他受保护路径
    if (!user.value) {
        // 未登录用户允许去 wizard
        if (to.path.startsWith('/wizard')) return

        // 其他页面跳转主站登录（携带回调地址）
        const isDev = process.dev
        const mainSiteBase = isDev ? 'http://localhost:3000' : 'https://mirauni.com'
        const planSiteBase = isDev ? 'http://localhost:3001' : 'https://plan.mirauni.com'
        const redirectUrl = encodeURIComponent(`${planSiteBase}${to.fullPath}`)
        const loginUrl = `${mainSiteBase}/login?redirect=${redirectUrl}&from=plan`
        return navigateTo(loginUrl, { external: true })
    }

    // 5. 已登录用户：如果没有规划，限制访问范围
    try {
        const { data: goals } = await client
            .from('goals')
            .select('id')
            .eq('user_id', user.value.id)
            .eq('status', 'active')
            .limit(1)

        const hasPlan = goals && goals.length > 0

        if (!hasPlan) {
            // 无规划用户只允许访问：首页、Wizard、公开契约页
            // (上文已经放行了 /p/ 和 /)
            if (to.path === '/' || to.path.startsWith('/wizard')) return

            // 其他页面 (如 /dashboard) 踢回首页
            return navigateTo('/')
        }
    } catch (e) {
        console.error('Auth check failed:', e)
    }

    return
})
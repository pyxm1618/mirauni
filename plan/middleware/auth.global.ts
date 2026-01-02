export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()

    // 1. 公开路径直接放行
    if (to.path === '/login') return

    // 2. 针对首页 / 的特殊处理
    if (to.path === '/') {
        // ... (existing logic)
    }

    // 3. 放行公开的契约页面 /p/*
    if (to.path.startsWith('/p/')) {
        return
    }

    // 4. 处理其他受保护路径
    if (!user.value) {
        // 未登录用户允许去 wizard
        if (to.path.startsWith('/wizard')) return
        
        // 其他页面全部去登录
        return navigateTo('/login')
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
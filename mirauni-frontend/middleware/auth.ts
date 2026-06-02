/**
 * 认证中间件
 * 检查用户是否已登录，未登录则跳转到登录页
 */
export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser()

    if (!user.value) {
        return navigateTo({
            path: '/login',
            query: { redirect: to.fullPath }
        })
    }
})

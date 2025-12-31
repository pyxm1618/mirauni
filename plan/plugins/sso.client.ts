/**
 * SSO Plugin: 接收来自主站的 sso_token 并设置 Supabase session
 */
export default defineNuxtPlugin(async (nuxtApp) => {
    // 仅在客户端执行
    if (!import.meta.client) return

    const route = useRoute()
    const router = useRouter()
    const supabase = useSupabaseClient()

    // 检查 URL 中是否有 sso_token
    const ssoToken = route.query.sso_token as string

    if (ssoToken) {
        console.log('[SSO] Received token from main site, setting session...')

        try {
            // 使用 access_token 获取用户信息并设置 session
            const { data, error } = await supabase.auth.getUser(ssoToken)

            if (!error && data.user) {
                // Token 有效，设置 session
                // 注意：这里我们只有 access_token，没有 refresh_token
                // 对于本地开发测试这是可以接受的
                await supabase.auth.setSession({
                    access_token: ssoToken,
                    refresh_token: '' // 没有 refresh_token，会话过期后需要重新从主站跳转
                })
                console.log('[SSO] Session set successfully for user:', data.user.email)
            } else {
                console.error('[SSO] Invalid token:', error)
            }
        } catch (e) {
            console.error('[SSO] Error setting session:', e)
        }

        // 清除 URL 中的 sso_token 参数
        const query = { ...route.query }
        delete query.sso_token
        router.replace({ query })
    }
})

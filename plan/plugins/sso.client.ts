/**
 * SSO Plugin: 接收来自主站的 sso tokens 并设置 Supabase session
 */
export default defineNuxtPlugin(async (nuxtApp) => {
    // 仅在客户端执行
    if (!import.meta.client) return

    const route = useRoute()
    const router = useRouter()
    const supabase = useSupabaseClient()

    // 检查 URL 中是否有 sso tokens
    const ssoAccess = route.query.sso_access as string
    const ssoRefresh = route.query.sso_refresh as string

    if (ssoAccess && ssoRefresh) {
        console.log('[SSO] Received tokens from main site, setting session...')

        try {
            // 设置 session
            const { data, error } = await supabase.auth.setSession({
                access_token: ssoAccess,
                refresh_token: ssoRefresh
            })

            if (!error && data.session) {
                console.log('[SSO] Session set successfully for user:', data.user?.email)
            } else {
                console.error('[SSO] Error setting session:', error)
            }
        } catch (e) {
            console.error('[SSO] Error:', e)
        }

        // 清除 URL 中的 sso 参数
        const query = { ...route.query }
        delete query.sso_access
        delete query.sso_refresh
        router.replace({ query })
    }
})

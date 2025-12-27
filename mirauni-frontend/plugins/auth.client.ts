/**
 * 认证初始化插件
 * 
 * 功能：
 * 1. 初始化用户状态
 * 2. 处理微信登录回调的 session
 */
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
    // 仅在客户端执行
    if (process.server) return

    const supabase = useSupabaseClient()
    const authStore = useAuthStore()
    const route = useRoute()
    const router = useRouter()

    // 处理微信登录回调的 session
    const wechatSession = route.query.wechat_session as string
    if (wechatSession) {
        try {
            const sessionData = JSON.parse(decodeURIComponent(wechatSession))

            if (sessionData.access_token && sessionData.refresh_token) {
                await supabase.auth.setSession({
                    access_token: sessionData.access_token,
                    refresh_token: sessionData.refresh_token
                })

                // 清除 URL 中的 session 参数
                const { wechat_session, ...otherQuery } = route.query
                await router.replace({ query: otherQuery })
            }
        } catch (e) {
            console.error('解析微信 session 失败:', e)
        }
    }

    // 初始化用户状态
    await authStore.init()

    // 监听认证状态变化
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
            authStore.setUser(null)
        } else if (event === 'SIGNED_IN' && session) {
            await authStore.fetchUser(session.user.id)
        } else if (event === 'TOKEN_REFRESHED' && session) {
            // Token 刷新后重新获取用户信息
            await authStore.fetchUser(session.user.id)
        }
    })
})

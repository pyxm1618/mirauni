/**
 * 认证相关的组合式函数
 */
import { useAuthStore } from '~/stores/auth'

export function useAuth() {
    const supabase = useSupabaseClient()
    const authStore = useAuthStore()
    const router = useRouter()
    const route = useRoute()

    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)
    const isLoading = computed(() => authStore.isLoading)

    /**
     * 发送短信验证码
     */
    async function sendSmsCode(phone: string) {
        const response = await $fetch('/api/auth/send-code', {
            method: 'POST',
            body: { phone }
        })

        return response
    }

    /**
     * 验证码登录
     */
    async function loginWithCode(phone: string, code: string) {
        console.log('[useAuth] loginWithCode called. Fetching /api/auth/verify-code...')
        const response = await $fetch<{
            success: boolean
            user: any
            session: {
                access_token: string
                refresh_token: string
                expires_at: number
            } | null
        }>('/api/auth/verify-code', {
            method: 'POST',
            body: { phone, code },
            timeout: 15000 // 15s timeout
        })
        console.log('[useAuth] /api/auth/verify-code response:', response)

        if (response.success && response.session) {
            // 设置 Supabase session
            await supabase.auth.setSession({
                access_token: response.session.access_token,
                refresh_token: response.session.refresh_token
            })

            // 更新 store
            authStore.setUser(response.user)

            // 跳转逻辑
            const redirect = route.query.redirect as string
            const fromPlan = route.query.from === 'plan'

            if (fromPlan && redirect) {
                // 来自钱途的登录请求，跳转回钱途并携带 SSO tokens
                try {
                    const targetUrl = new URL(decodeURIComponent(redirect))
                    targetUrl.searchParams.set('sso_access', response.session.access_token)
                    targetUrl.searchParams.set('sso_refresh', response.session.refresh_token)
                    window.location.href = targetUrl.toString()
                    return response
                } catch (e) {
                    console.error('[useAuth] Invalid redirect URL:', e)
                }
            }

            // 默认跳转
            await router.push(redirect || '/')

            return response
        }

        throw new Error('登录失败')
    }

    /**
     * 获取微信登录 URL
     */
    async function getWechatLoginUrl() {
        const response = await $fetch<{ url: string }>('/api/auth/wechat/url')
        return response.url
    }

    /**
     * 绑定手机号
     */
    async function bindPhone(phone: string, code: string, openid: string) {
        const response = await $fetch('/api/auth/bind-phone', {
            method: 'POST',
            body: { phone, code, openid }
        })

        return response
    }

    /**
     * 退出登录
     */
    async function logout() {
        await authStore.logout()
    }

    /**
     * 刷新用户信息
     */
    async function refreshUser() {
        await authStore.fetchUser()
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        sendSmsCode,
        loginWithCode,
        getWechatLoginUrl,
        bindPhone,
        logout,
        refreshUser
    }
}

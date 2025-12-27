/**
 * 认证相关的组合式函数
 */
export function useAuth() {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    const isAuthenticated = computed(() => !!user.value)

    /**
     * 发送短信验证码
     */
    async function sendSmsCode(phone: string) {
        const { data, error } = await useFetch('/api/auth/send-code', {
            method: 'POST',
            body: { phone }
        })

        if (error.value) {
            throw new Error(error.value.message || '发送验证码失败')
        }

        return data.value
    }

    /**
     * 验证码登录
     */
    async function loginWithCode(phone: string, code: string) {
        const { data, error } = await useFetch('/api/auth/verify-code', {
            method: 'POST',
            body: { phone, code }
        })

        if (error.value) {
            throw new Error(error.value.message || '登录失败')
        }

        return data.value
    }

    /**
     * 获取微信登录 URL
     */
    async function getWechatLoginUrl() {
        const { data, error } = await useFetch('/api/auth/wechat/url')

        if (error.value) {
            throw new Error(error.value.message || '获取微信登录链接失败')
        }

        return data.value
    }

    /**
     * 退出登录
     */
    async function logout() {
        await supabase.auth.signOut()
        navigateTo('/login')
    }

    return {
        user,
        isAuthenticated,
        sendSmsCode,
        loginWithCode,
        getWechatLoginUrl,
        logout
    }
}

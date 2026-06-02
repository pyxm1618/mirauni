/**
 * 用户状态管理 Store
 */
import { defineStore } from 'pinia'
import type { User } from '~/types'

interface AuthState {
    user: User | null
    isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        isLoading: true
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,

        userCredits: (state) => state.user?.unlock_credits || 0,

        isFirstCharge: (state) => state.user?.is_first_charge ?? true
    },

    actions: {
        /**
         * 设置用户信息
         */
        setUser(user: User | null) {
            this.user = user
            this.isLoading = false
        },

        /**
         * 初始化用户状态（从 Supabase session 恢复）
         */
        async init() {
            const supabase = useSupabaseClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                await this.fetchUser(session.user.id)
            } else {
                this.isLoading = false
            }
        },

        /**
         * 获取用户详细信息
         */
        async fetchUser(userId?: string) {
            const supabase = useSupabaseClient()

            try {
                let id = userId

                if (!id) {
                    const { data: { user: authUser } } = await supabase.auth.getUser()
                    id = authUser?.id
                }

                if (!id) {
                    this.user = null
                    this.isLoading = false
                    return
                }

                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) {
                    console.error('获取用户信息失败:', error)
                    this.user = null
                } else {
                    this.user = data as User
                }
            } catch (e) {
                console.error('获取用户信息异常:', e)
                this.user = null
            } finally {
                this.isLoading = false
            }
        },

        /**
         * 更新用户信息
         */
        updateUser(updates: Partial<User>) {
            if (this.user) {
                this.user = { ...this.user, ...updates }
            }
        },

        /**
         * 退出登录
         */
        async logout() {
            const supabase = useSupabaseClient()
            await supabase.auth.signOut()
            this.user = null
            navigateTo('/login')
        },

        /**
         * 扣减解锁次数
         */
        deductCredits(count: number = 1) {
            if (this.user && this.user.unlock_credits >= count) {
                this.user.unlock_credits -= count
            }
        }
    }
})

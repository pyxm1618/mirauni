import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('admin_token') || null,
        admin: JSON.parse(localStorage.getItem('admin_info') || 'null')
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        adminRole: (state) => state.admin?.admin_role || null
    },

    actions: {
        async login(username, password) {
            try {
                const response = await api.post('/admin/login', { username, password })
                const { token, admin } = response.data.data

                this.token = token
                this.admin = admin

                localStorage.setItem('admin_token', token)
                localStorage.setItem('admin_info', JSON.stringify(admin))

                return { success: true }
            } catch (error) {
                return {
                    success: false,
                    message: error.response?.data?.error?.message || '登录失败'
                }
            }
        },

        logout() {
            this.token = null
            this.admin = null
            localStorage.removeItem('admin_token')
            localStorage.removeItem('admin_info')
        }
    }
})

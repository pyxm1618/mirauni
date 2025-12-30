export const useUser = () => {
    const user = useSupabaseUser()

    const isAuthenticated = computed(() => !!user.value)

    const userInfo = computed(() => {
        if (!user.value) return null
        return {
            id: user.value.id,
            email: user.value.email,
            nickname: user.value.user_metadata?.nickname || user.value.email?.split('@')[0] || 'User',
            avatarUrl: user.value.user_metadata?.avatar_url
        }
    })

    return {
        user,
        isAuthenticated,
        userInfo
    }
}

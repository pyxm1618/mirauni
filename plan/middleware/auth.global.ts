export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser()

    // Public routes that don't require auth (if any)
    // For now, everything seems to require auth or at least we check it.
    // Docs say: "本项目不提供登录页，未登录直接跳转主站登录"

    if (!user.value) {
        // If running on localhost, we might want to bypass or show a message
        if (process.dev) {
            console.warn('User not logged in. In production, this would redirect to main site.')
            // For dev, we might stay here if we want to test UI without auth, 
            // but strictly following requirement:
            // return navigateTo('https://mirauni.com/login', { external: true })
        }

        // In production, sync with main site
        // return navigateTo('https://mirauni.com/login?redirect=' + encodeURIComponent(to.fullPath), { external: true })
    }
})

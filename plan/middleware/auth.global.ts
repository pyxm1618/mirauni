export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser()

    // Public routes that don't require auth
    // Add any public paths here if needed, e.g., '/about'
    const publicRoutes: string[] = ['/', '/wizard', '/wizard/']

    // Check if path starts with public route (for nested paths like /wizard/...)
    // Actually, we only want specific routes or prefixes.
    // Let's make it simple: whitelist specific paths or prefixes.

    // Allow root
    if (to.path === '/') return

    // Allow wizard start (but sub-steps might be protected if needed, though we decided wizard is lazy auth)
    if (to.path.startsWith('/wizard')) return

    if (publicRoutes.includes(to.path)) {
        return
    }

    if (!user.value) {
        // Redirection logic
        const isDev = import.meta.dev
        const loginUrl = isDev ? 'http://localhost:3000/login' : 'https://mirauni.com/login'

        // Redirect to main site login with return URL
        // We use window.location.href for external redirect in client-side navigation context
        // But in middleware, navigateTo with external: true is the Nuxt way

        // Construct the full return URL
        const returnUrl = isDev
            ? `http://localhost:3001${to.fullPath}`
            : `https://plan.mirauni.com${to.fullPath}`

        return navigateTo(`${loginUrl}?redirect=${encodeURIComponent(returnUrl)}`, { external: true })
    }
})

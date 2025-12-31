export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser()

    // Public routes that don't require auth
    // Add any public paths here if needed, e.g., '/about'
    const publicRoutes: string[] = []
    if (publicRoutes.includes(to.path)) {
        return
    }

    // Protect wizard routes explicitly
    if (to.path.startsWith('/wizard') && !user.value) {
        // Redirection logic
        const isDev = import.meta.dev
        const loginUrl = isDev ? 'http://localhost:3000/login' : 'https://mirauni.com/login'

        // Construct the full return URL
        const returnUrl = isDev
            ? `http://localhost:3001${to.fullPath}`
            : `https://plan.mirauni.com${to.fullPath}`

        return navigateTo(`${loginUrl}?redirect=${encodeURIComponent(returnUrl)}`, { external: true })
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

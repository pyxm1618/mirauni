import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('@/views/Dashboard.vue')
            },
            {
                path: 'users',
                name: 'Users',
                component: () => import('@/views/users/Index.vue')
            },
            {
                path: 'projects',
                name: 'Projects',
                component: () => import('@/views/projects/Index.vue')
            },
            {
                path: 'projects/review',
                name: 'ProjectReview',
                component: () => import('@/views/projects/Review.vue')
            },
            {
                path: 'articles',
                name: 'Articles',
                component: () => import('@/views/articles/Index.vue')
            },
            {
                path: 'orders',
                name: 'Orders',
                component: () => import('@/views/orders/Index.vue')
            },
            {
                path: 'analytics',
                name: 'Analytics',
                component: () => import('@/views/analytics/Overview.vue')
            },
            {
                path: 'analytics/funnel',
                name: 'Funnel',
                component: () => import('@/views/analytics/Funnel.vue')
            },
            {
                path: 'analytics/events',
                name: 'Events',
                component: () => import('@/views/analytics/Events.vue')
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('admin_token')

    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else if (to.path === '/login' && token) {
        next('/')
    } else {
        next()
    }
})

export default router

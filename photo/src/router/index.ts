import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/projects',
            name: 'projects',
            component: () => import('../views/Projects.vue')
        },
        {
            path: '/talent',
            name: 'talent',
            component: () => import('../views/Talent.vue')
        },
    ]
})

export default router

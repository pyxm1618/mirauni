import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DashboardStats = {
    totalGoal: number
    currentIncome: number
    progress: number
    daysLeft: number
    totalTasks: number
    completedTasks: number
}

export type SupervisionData = {
    supervisors: any[]
    interactions: any[]
    alertLevel: string
    checkinStreak: number
}

/**
 * Dashboard Store - 用于缓存 Dashboard 数据，实现 SWR 模式
 * 
 * 核心思路：
 * - 首次加载：显示骨架屏，fetch 后缓存
 * - 再次访问：优先显示缓存，后台静默刷新
 */
export const useDashboardStore = defineStore('dashboard', () => {
    // 缓存的数据（初始为 null，表示"尚未加载过"）
    const cachedStats = ref<DashboardStats | null>(null)
    const cachedSupervision = ref<SupervisionData | null>(null)
    const cachedTasks = ref<any[] | null>(null)
    const lastFetchTime = ref<number | null>(null)

    // 更新缓存
    function updateCache(data: {
        stats?: DashboardStats
        supervision?: SupervisionData
        tasks?: any[]
    }) {
        if (data.stats) cachedStats.value = data.stats
        if (data.supervision) cachedSupervision.value = data.supervision
        if (data.tasks) cachedTasks.value = data.tasks
        lastFetchTime.value = Date.now()
    }

    // 判断缓存是否有效（默认 5 分钟）
    function isCacheValid(maxAgeMs = 5 * 60 * 1000) {
        if (!lastFetchTime.value) return false
        return Date.now() - lastFetchTime.value < maxAgeMs
    }

    // 清除缓存（用于登出或重置）
    function clearCache() {
        cachedStats.value = null
        cachedSupervision.value = null
        cachedTasks.value = null
        lastFetchTime.value = null
    }

    return {
        cachedStats,
        cachedSupervision,
        cachedTasks,
        lastFetchTime,
        updateCache,
        isCacheValid,
        clearCache
    }
})

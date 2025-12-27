<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const stats = ref({
  totalUsers: 0,
  todayNewUsers: 0,
  totalProjects: 0,
  pendingProjects: 0,
  totalOrders: 0,
  todayRevenue: 0
})

const loading = ref(true)

const statCards = [
  { key: 'totalUsers', label: '总用户数', icon: '👥', color: 'from-blue-500 to-cyan-500' },
  { key: 'todayNewUsers', label: '今日新增', icon: '🆕', color: 'from-green-500 to-emerald-500' },
  { key: 'totalProjects', label: '总项目数', icon: '📁', color: 'from-purple-500 to-pink-500' },
  { key: 'pendingProjects', label: '待审核', icon: '⏳', color: 'from-orange-500 to-yellow-500' },
  { key: 'totalOrders', label: '总订单数', icon: '💰', color: 'from-indigo-500 to-blue-500' },
  { key: 'todayRevenue', label: '今日收入', icon: '💵', color: 'from-pink-500 to-rose-500', isCurrency: true }
]

const fetchDashboard = async () => {
  try {
    const response = await api.get('/admin/dashboard')
    if (response.data.success) {
      stats.value = response.data.data.stats
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
  } finally {
    loading.value = false
  }
}

const formatValue = (value, isCurrency) => {
  if (isCurrency) {
    return `¥${(value / 100).toFixed(2)}`
  }
  return value.toLocaleString()
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">仪表盘</h1>
      <button 
        @click="fetchDashboard"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        刷新数据
      </button>
    </div>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="card in statCards" 
        :key="card.key"
        class="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div :class="['h-2 bg-gradient-to-r', card.color]"></div>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">{{ card.label }}</p>
              <p v-if="loading" class="text-2xl font-bold text-gray-300 mt-1">--</p>
              <p v-else class="text-2xl font-bold text-gray-800 mt-1">
                {{ formatValue(stats[card.key], card.isCurrency) }}
              </p>
            </div>
            <div class="text-4xl">{{ card.icon }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快捷操作 -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">快捷操作</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link 
          to="/projects/review"
          class="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <span class="text-3xl mb-2">✅</span>
          <span class="text-sm text-gray-600">审核项目</span>
          <span v-if="stats.pendingProjects > 0" class="mt-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
            {{ stats.pendingProjects }}
          </span>
        </router-link>
        
        <router-link 
          to="/articles"
          class="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <span class="text-3xl mb-2">✏️</span>
          <span class="text-sm text-gray-600">发布文章</span>
        </router-link>
        
        <router-link 
          to="/users"
          class="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <span class="text-3xl mb-2">👥</span>
          <span class="text-sm text-gray-600">用户管理</span>
        </router-link>
        
        <router-link 
          to="/analytics"
          class="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <span class="text-3xl mb-2">📈</span>
          <span class="text-sm text-gray-600">数据分析</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

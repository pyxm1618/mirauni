<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const loading = ref(true)
const range = ref(7)
const trendData = ref([])

const statCards = ref([
  { key: 'register', label: '今日注册', value: 0, icon: '📝', color: 'from-blue-500 to-cyan-500' },
  { key: 'recharge', label: '今日付费', value: 0, icon: '💰', color: 'from-green-500 to-emerald-500' },
  { key: 'unlock', label: '今日解锁', value: 0, icon: '🔓', color: 'from-purple-500 to-pink-500' }
])

const fetchTrend = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/analytics/trend', { params: { range: range.value } })
    if (response.data.success) {
      trendData.value = response.data.data || []
      
      // 计算今日数据
      const today = new Date().toISOString().split('T')[0]
      const todayData = trendData.value.find(d => d.date === today) || {}
      statCards.value[0].value = todayData.register || 0
      statCards.value[1].value = todayData.recharge || 0
      statCards.value[2].value = todayData.unlock || 0
    }
  } catch (error) {
    console.error('获取趋势数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTrend()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">数据分析</h1>
      <div class="flex gap-2">
        <button 
          v-for="days in [7, 14, 30]" 
          :key="days"
          @click="range = days; fetchTrend()"
          :class="[
            'px-4 py-2 rounded-lg',
            range === days ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
          ]"
        >
          {{ days }}天
        </button>
      </div>
    </div>
    
    <!-- 今日统计 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div 
        v-for="card in statCards" 
        :key="card.key"
        class="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div :class="['h-2 bg-gradient-to-r', card.color]"></div>
        <div class="p-6 flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">{{ card.label }}</p>
            <p class="text-2xl font-bold text-gray-800 mt-1">{{ card.value }}</p>
          </div>
          <div class="text-4xl">{{ card.icon }}</div>
        </div>
      </div>
    </div>
    
    <!-- 趋势图表 (简化版) -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">趋势数据</h2>
      
      <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>
      
      <div v-else-if="trendData.length === 0" class="text-center py-8 text-gray-500">暂无数据</div>
      
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">日期</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">注册</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">付费</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">解锁</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="item in trendData" :key="item.date" class="hover:bg-gray-50">
              <td class="px-4 py-2 text-gray-600">{{ item.date }}</td>
              <td class="px-4 py-2 text-right text-blue-600 font-medium">{{ item.register || 0 }}</td>
              <td class="px-4 py-2 text-right text-green-600 font-medium">{{ item.recharge || 0 }}</td>
              <td class="px-4 py-2 text-right text-purple-600 font-medium">{{ item.unlock || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 快捷入口 -->
    <div class="grid grid-cols-2 gap-4">
      <router-link 
        to="/analytics/funnel"
        class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-center"
      >
        <span class="text-4xl block mb-2">📊</span>
        <h3 class="font-semibold text-gray-800">转化漏斗</h3>
        <p class="text-sm text-gray-500 mt-1">查看用户转化路径</p>
      </router-link>
      
      <router-link 
        to="/analytics/events"
        class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-center"
      >
        <span class="text-4xl block mb-2">📋</span>
        <h3 class="font-semibold text-gray-800">事件明细</h3>
        <p class="text-sm text-gray-500 mt-1">查看事件日志</p>
      </router-link>
    </div>
  </div>
</template>

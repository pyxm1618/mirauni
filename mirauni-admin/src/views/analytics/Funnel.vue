<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const loading = ref(true)
const days = ref(7)
const funnelData = ref([])

const stepNames = {
  page_view: '访问',
  register: '注册',
  project_view: '查看项目',
  unlock_click: '点击解锁',
  recharge_success: '付费',
  unlock_success: '解锁成功'
}

const fetchFunnel = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/analytics/funnel', { params: { days: days.value } })
    if (response.data.success) {
      funnelData.value = response.data.data || []
    }
  } catch (error) {
    console.error('获取漏斗数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchFunnel()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <router-link to="/analytics" class="text-gray-500 hover:text-gray-700">← 返回</router-link>
        <h1 class="text-2xl font-bold text-gray-800">转化漏斗</h1>
      </div>
      <div class="flex gap-2">
        <button 
          v-for="d in [7, 14, 30]" 
          :key="d"
          @click="days = d; fetchFunnel()"
          :class="[
            'px-4 py-2 rounded-lg',
            days === d ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
          ]"
        >
          {{ d }}天
        </button>
      </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-lg p-6">
      <div v-if="loading" class="text-center py-8 text-gray-500">加载中...</div>
      
      <div v-else-if="funnelData.length === 0" class="text-center py-8 text-gray-500">暂无数据</div>
      
      <div v-else class="space-y-4">
        <div 
          v-for="(step, index) in funnelData" 
          :key="step.event"
          class="relative"
        >
          <!-- 漏斗条 -->
          <div class="flex items-center gap-4">
            <div class="w-24 text-right text-sm text-gray-600">
              {{ stepNames[step.event] || step.event }}
            </div>
            <div class="flex-1 relative h-12">
              <div 
                class="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-end px-4"
                :style="{ width: `${Math.max(step.percentage, 5)}%` }"
              >
                <span class="text-white font-semibold">{{ step.count }}</span>
              </div>
            </div>
            <div class="w-20 text-sm text-gray-600">
              {{ step.percentage }}%
            </div>
          </div>
          
          <!-- 转化率 -->
          <div v-if="step.conversionToNext" class="ml-24 pl-4 py-2 text-sm text-gray-400">
            ↓ 转化率: {{ step.conversionToNext }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

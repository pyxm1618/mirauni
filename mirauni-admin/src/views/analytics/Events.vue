<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const events = ref([])
const loading = ref(true)
const pagination = ref({ page: 1, pageSize: 50, total: 0 })
const filter = ref({ eventName: '', userId: '' })

const eventTypes = [
  { value: '', label: '全部事件' },
  { value: 'page_view', label: '页面浏览' },
  { value: 'register', label: '注册' },
  { value: 'project_view', label: '查看项目' },
  { value: 'developer_view', label: '查看开发者' },
  { value: 'unlock_click', label: '点击解锁' },
  { value: 'recharge_success', label: '充值成功' },
  { value: 'unlock_success', label: '解锁成功' },
  { value: 'message_send', label: '发送消息' }
]

const fetchEvents = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...(filter.value.eventName && { eventName: filter.value.eventName }),
      ...(filter.value.userId && { userId: filter.value.userId })
    }
    const response = await api.get('/admin/analytics/events', { params })
    if (response.data.success) {
      events.value = response.data.data || []
      pagination.value.total = response.data.meta?.total || 0
    }
  } catch (error) {
    console.error('获取事件列表失败:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleString('zh-CN')

const formatParams = (params) => {
  if (!params) return '-'
  try {
    return JSON.stringify(params, null, 2)
  } catch {
    return '-'
  }
}

onMounted(() => {
  fetchEvents()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <router-link to="/analytics" class="text-gray-500 hover:text-gray-700">← 返回</router-link>
      <h1 class="text-2xl font-bold text-gray-800">事件明细</h1>
    </div>
    
    <!-- 筛选 -->
    <div class="bg-white rounded-xl shadow-lg p-4 flex gap-4">
      <select v-model="filter.eventName" @change="fetchEvents()" class="px-4 py-2 border rounded-lg">
        <option v-for="opt in eventTypes" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input 
        v-model="filter.userId"
        type="text"
        placeholder="用户ID"
        class="px-4 py-2 border rounded-lg"
        @keyup.enter="fetchEvents()"
      />
      <button @click="fetchEvents()" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        查询
      </button>
    </div>
    
    <!-- 事件列表 -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">事件</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">页面</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">参数</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading"><td colspan="5" class="px-6 py-8 text-center text-gray-500">加载中...</td></tr>
          <tr v-else-if="events.length === 0"><td colspan="5" class="px-6 py-8 text-center text-gray-500">暂无事件</td></tr>
          <tr v-for="event in events" :key="event.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(event.created_at) }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {{ event.event_name }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 font-mono">
              {{ event.user_id ? event.user_id.slice(0, 8) + '...' : '匿名' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
              {{ event.page_url || '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              <code class="text-xs bg-gray-100 px-2 py-1 rounded">
                {{ formatParams(event.event_params) }}
              </code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分页 -->
    <div class="flex justify-center gap-2">
      <button 
        :disabled="pagination.page <= 1"
        @click="pagination.page--; fetchEvents()"
        class="px-4 py-2 border rounded-lg disabled:opacity-50"
      >上一页</button>
      <span class="px-4 py-2">{{ pagination.page }}</span>
      <button @click="pagination.page++; fetchEvents()" class="px-4 py-2 border rounded-lg">下一页</button>
    </div>
  </div>
</template>

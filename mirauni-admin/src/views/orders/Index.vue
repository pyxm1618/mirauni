<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const orders = ref([])
const loading = ref(true)
const pagination = ref({ page: 1, pageSize: 20, total: 0 })
const filter = ref({ status: '' })

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待支付' },
  { value: 'paid', label: '已支付' },
  { value: 'failed', label: '失败' },
  { value: 'refunded', label: '已退款' }
]

const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...(filter.value.status && { status: filter.value.status })
    }
    const response = await api.get('/admin/orders', { params })
    if (response.data.success) {
      orders.value = response.data.data
      pagination.value.total = response.data.meta?.total || 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

const getStatusLabel = (status) => {
  const map = { pending: '待支付', paid: '已支付', failed: '失败', refunded: '已退款' }
  return map[status] || status
}

const getStatusClass = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700'
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const formatAmount = (amount) => `¥${(amount / 100).toFixed(2)}`
const formatDate = (dateStr) => new Date(dateStr).toLocaleString('zh-CN')

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">订单管理</h1>
    
    <!-- 筛选 -->
    <div class="bg-white rounded-xl shadow-lg p-4 flex gap-4">
      <select v-model="filter.status" @change="fetchOrders()" class="px-4 py-2 border rounded-lg">
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>
    
    <!-- 订单列表 -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单号</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">获得次数</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">支付时间</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading"><td colspan="7" class="px-6 py-8 text-center text-gray-500">加载中...</td></tr>
          <tr v-else-if="orders.length === 0"><td colspan="7" class="px-6 py-8 text-center text-gray-500">暂无订单</td></tr>
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ order.order_no }}</td>
            <td class="px-6 py-4 text-gray-600">{{ order.users?.username || order.users?.phone || '-' }}</td>
            <td class="px-6 py-4 font-medium text-gray-800">{{ formatAmount(order.amount) }}</td>
            <td class="px-6 py-4 text-gray-600">{{ order.credits }} 次</td>
            <td class="px-6 py-4">
              <span :class="['px-2 py-1 rounded-full text-xs', getStatusClass(order.status)]">
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(order.created_at) }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ order.paid_at ? formatDate(order.paid_at) : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分页 -->
    <div class="flex justify-center gap-2">
      <button 
        :disabled="pagination.page <= 1"
        @click="pagination.page--; fetchOrders()"
        class="px-4 py-2 border rounded-lg disabled:opacity-50"
      >上一页</button>
      <span class="px-4 py-2">{{ pagination.page }}</span>
      <button @click="pagination.page++; fetchOrders()" class="px-4 py-2 border rounded-lg">下一页</button>
    </div>
  </div>
</template>

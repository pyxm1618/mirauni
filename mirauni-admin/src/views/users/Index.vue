<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const users = ref([])
const loading = ref(true)
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})
const search = ref('')

const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...(search.value && { keyword: search.value })
    }
    const response = await api.get('/admin/users', { params })
    if (response.data.success) {
      users.value = response.data.data
      pagination.value.total = response.data.meta?.total || 0
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleBan = async (user) => {
  const action = user.status === 'active' ? 'ban' : 'unban'
  const confirmMsg = user.status === 'active' ? `确定封禁用户 ${user.username}？` : `确定解封用户 ${user.username}？`
  
  if (!confirm(confirmMsg)) return
  
  try {
    await api.post(`/admin/users/${user.id}/${action}`)
    await fetchUsers()
  } catch (error) {
    alert(error.response?.data?.error?.message || '操作失败')
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchUsers()
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">用户管理</h1>
    </div>
    
    <!-- 搜索栏 -->
    <div class="bg-white rounded-xl shadow-lg p-4">
      <div class="flex gap-4">
        <input
          v-model="search"
          type="text"
          placeholder="搜索用户名、手机号..."
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="handleSearch"
        />
        <button 
          @click="handleSearch"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          搜索
        </button>
      </div>
    </div>
    
    <!-- 用户列表 -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手机号</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">解锁余额</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">加载中...</td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">暂无用户数据</td>
          </tr>
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img 
                  :src="user.avatar_url || 'https://via.placeholder.com/40'" 
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p class="font-medium text-gray-800">{{ user.username || '未设置' }}</p>
                  <p class="text-sm text-gray-500">{{ user.bio || '-' }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ user.phone || '-' }}</td>
            <td class="px-6 py-4">
              <span 
                :class="[
                  'px-2 py-1 rounded-full text-xs',
                  user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                ]"
              >
                {{ user.status === 'active' ? '正常' : '已封禁' }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ user.unlock_credits || 0 }} 次</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(user.created_at) }}</td>
            <td class="px-6 py-4">
              <button 
                @click="handleBan(user)"
                :class="[
                  'px-3 py-1 rounded text-sm',
                  user.status === 'active' 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                ]"
              >
                {{ user.status === 'active' ? '封禁' : '解封' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分页 -->
    <div class="flex justify-center gap-2">
      <button 
        :disabled="pagination.page <= 1"
        @click="pagination.page--; fetchUsers()"
        class="px-4 py-2 border rounded-lg disabled:opacity-50"
      >
        上一页
      </button>
      <span class="px-4 py-2">{{ pagination.page }}</span>
      <button 
        @click="pagination.page++; fetchUsers()"
        class="px-4 py-2 border rounded-lg"
      >
        下一页
      </button>
    </div>
  </div>
</template>

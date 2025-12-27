<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const projects = ref([])
const loading = ref(true)
const pagination = ref({ page: 1, pageSize: 20, total: 0 })
const filter = ref({ status: '', category: '' })

const categories = [
  { value: '', label: '全部分类' },
  { value: 'saas', label: 'SaaS 工具' },
  { value: 'app', label: '移动应用' },
  { value: 'game', label: '游戏' },
  { value: 'ai', label: 'AI / 人工智能' },
  { value: 'ecommerce', label: '电商' },
  { value: 'content', label: '内容/社区' },
  { value: 'hardware', label: '智能硬件' },
  { value: 'other', label: '其他' }
]

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待审核' },
  { value: 'active', label: '招募中' },
  { value: 'closed', label: '已关闭' },
  { value: 'rejected', label: '已拒绝' }
]

const fetchProjects = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...(filter.value.status && { status: filter.value.status }),
      ...(filter.value.category && { category: filter.value.category })
    }
    const response = await api.get('/admin/projects', { params })
    if (response.data.success) {
      projects.value = response.data.data
      pagination.value.total = response.data.meta?.total || 0
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleClose = async (project) => {
  if (!confirm(`确定下架项目"${project.title}"？`)) return
  
  try {
    await api.post(`/admin/projects/${project.id}/close`)
    await fetchProjects()
  } catch (error) {
    alert(error.response?.data?.error?.message || '操作失败')
  }
}

const getStatusLabel = (status) => {
  const map = { pending: '待审核', active: '招募中', closed: '已关闭', rejected: '已拒绝' }
  return map[status] || status
}

const getStatusClass = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
    rejected: 'bg-red-100 text-red-700'
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('zh-CN')

onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800">项目管理</h1>
    
    <!-- 筛选 -->
    <div class="bg-white rounded-xl shadow-lg p-4 flex gap-4">
      <select v-model="filter.status" @change="fetchProjects()" class="px-4 py-2 border rounded-lg">
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <select v-model="filter.category" @change="fetchProjects()" class="px-4 py-2 border rounded-lg">
        <option v-for="opt in categories" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>
    
    <!-- 项目列表 -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">项目</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">发布者</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">发布时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading"><td colspan="6" class="px-6 py-8 text-center text-gray-500">加载中...</td></tr>
          <tr v-else-if="projects.length === 0"><td colspan="6" class="px-6 py-8 text-center text-gray-500">暂无项目</td></tr>
          <tr v-for="project in projects" :key="project.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <p class="font-medium text-gray-800">{{ project.title }}</p>
              <p class="text-sm text-gray-500">{{ project.summary }}</p>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ project.users?.username || '-' }}</td>
            <td class="px-6 py-4 text-gray-600">{{ project.category }}</td>
            <td class="px-6 py-4">
              <span :class="['px-2 py-1 rounded-full text-xs', getStatusClass(project.status)]">
                {{ getStatusLabel(project.status) }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(project.created_at) }}</td>
            <td class="px-6 py-4 space-x-2">
              <button 
                v-if="project.status === 'active'"
                @click="handleClose(project)"
                class="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
              >下架</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

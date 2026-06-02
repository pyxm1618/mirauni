<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const projects = ref([])
const loading = ref(true)

const fetchPendingProjects = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/projects', { params: { status: 'pending' } })
    if (response.data.success) {
      projects.value = response.data.data
    }
  } catch (error) {
    console.error('获取待审核项目失败:', error)
  } finally {
    loading.value = false
  }
}

const handleApprove = async (project) => {
  if (!confirm(`确定通过项目"${project.title}"？`)) return
  
  try {
    await api.post(`/admin/projects/${project.id}/approve`)
    await fetchPendingProjects()
    alert('审核通过')
  } catch (error) {
    alert(error.response?.data?.error?.message || '操作失败')
  }
}

const handleReject = async (project) => {
  const reason = prompt('请输入拒绝原因：')
  if (!reason) return
  
  try {
    await api.post(`/admin/projects/${project.id}/reject`, { reason })
    await fetchPendingProjects()
    alert('已拒绝')
  } catch (error) {
    alert(error.response?.data?.error?.message || '操作失败')
  }
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleString('zh-CN')

onMounted(() => {
  fetchPendingProjects()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">项目审核</h1>
      <span class="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
        待审核: {{ projects.length }}
      </span>
    </div>
    
    <div v-if="loading" class="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
      加载中...
    </div>
    
    <div v-else-if="projects.length === 0" class="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
      🎉 暂无待审核项目
    </div>
    
    <div v-else class="space-y-4">
      <div 
        v-for="project in projects" 
        :key="project.id"
        class="bg-white rounded-xl shadow-lg p-6"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800">{{ project.title }}</h3>
            <p class="text-gray-500 mt-1">{{ project.summary }}</p>
            
            <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="text-gray-400">分类:</span>
                <span class="ml-2 text-gray-700">{{ project.category }}</span>
              </div>
              <div>
                <span class="text-gray-400">工作模式:</span>
                <span class="ml-2 text-gray-700">{{ project.work_mode }}</span>
              </div>
              <div>
                <span class="text-gray-400">合作方式:</span>
                <span class="ml-2 text-gray-700">{{ project.cooperation_type }}</span>
              </div>
              <div>
                <span class="text-gray-400">发布者:</span>
                <span class="ml-2 text-gray-700">{{ project.users?.username || '-' }}</span>
              </div>
            </div>
            
            <div v-if="project.description" class="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              {{ project.description }}
            </div>
            
            <p class="mt-4 text-xs text-gray-400">提交时间: {{ formatDate(project.created_at) }}</p>
          </div>
          
          <div class="ml-6 flex flex-col gap-2">
            <button 
              @click="handleApprove(project)"
              class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              通过
            </button>
            <button 
              @click="handleReject(project)"
              class="px-6 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            >
              拒绝
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

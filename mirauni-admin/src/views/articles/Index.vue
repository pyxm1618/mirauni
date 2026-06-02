<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const articles = ref([])
const loading = ref(true)
const showEditor = ref(false)
const editingArticle = ref(null)

const form = ref({
  title: '',
  slug: '',
  summary: '',
  content: '',
  category: 'tutorial',
  status: 'draft'
})

const categories = [
  { value: 'tutorial', label: '教程' },
  { value: 'case', label: '案例' },
  { value: 'insight', label: '洞察' },
  { value: 'news', label: '资讯' }
]

const fetchArticles = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/articles')
    if (response.data.success) {
      articles.value = response.data.data
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

const openEditor = (article = null) => {
  if (article) {
    editingArticle.value = article
    form.value = { ...article }
  } else {
    editingArticle.value = null
    form.value = { title: '', slug: '', summary: '', content: '', category: 'tutorial', status: 'draft' }
  }
  showEditor.value = true
}

const saveArticle = async () => {
  try {
    if (editingArticle.value) {
      await api.put(`/admin/articles/${editingArticle.value.id}`, form.value)
    } else {
      await api.post('/admin/articles', form.value)
    }
    showEditor.value = false
    await fetchArticles()
    alert('保存成功')
  } catch (error) {
    alert(error.response?.data?.error?.message || '保存失败')
  }
}

const deleteArticle = async (article) => {
  if (!confirm(`确定删除文章"${article.title}"？`)) return
  
  try {
    await api.delete(`/admin/articles/${article.id}`)
    await fetchArticles()
  } catch (error) {
    alert(error.response?.data?.error?.message || '删除失败')
  }
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('zh-CN')

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">文章管理</h1>
      <button 
        @click="openEditor()"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        + 发布文章
      </button>
    </div>
    
    <!-- 文章列表 -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">浏览量</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">发布时间</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading"><td colspan="6" class="px-6 py-8 text-center text-gray-500">加载中...</td></tr>
          <tr v-else-if="articles.length === 0"><td colspan="6" class="px-6 py-8 text-center text-gray-500">暂无文章</td></tr>
          <tr v-for="article in articles" :key="article.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <p class="font-medium text-gray-800">{{ article.title }}</p>
              <p class="text-sm text-gray-500">/academy/{{ article.slug }}</p>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ article.category }}</td>
            <td class="px-6 py-4">
              <span :class="['px-2 py-1 rounded-full text-xs', article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700']">
                {{ article.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-600">{{ article.view_count || 0 }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ formatDate(article.created_at) }}</td>
            <td class="px-6 py-4 space-x-2">
              <button @click="openEditor(article)" class="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200">编辑</button>
              <button @click="deleteArticle(article)" class="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 编辑器弹窗 -->
    <div v-if="showEditor" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <h2 class="text-xl font-bold mb-6">{{ editingArticle ? '编辑文章' : '发布文章' }}</h2>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
              <input v-model="form.title" type="text" class="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
              <input v-model="form.slug" type="text" class="w-full px-4 py-2 border rounded-lg" placeholder="如: how-to-find-cofounder" />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select v-model="form.category" class="w-full px-4 py-2 border rounded-lg">
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select v-model="form.status" class="w-full px-4 py-2 border rounded-lg">
                <option value="draft">草稿</option>
                <option value="published">发布</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">摘要</label>
            <textarea v-model="form.summary" rows="2" class="w-full px-4 py-2 border rounded-lg"></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">内容 (Markdown)</label>
            <textarea v-model="form.content" rows="15" class="w-full px-4 py-2 border rounded-lg font-mono text-sm"></textarea>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end gap-4">
          <button @click="showEditor = false" class="px-6 py-2 border rounded-lg hover:bg-gray-50">取消</button>
          <button @click="saveArticle" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

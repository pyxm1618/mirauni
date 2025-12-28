<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import { 
  Users, 
  UserPlus, 
  FolderOpen, 
  FileClock, 
  ShoppingCart, 
  Banknote,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  FileEdit,
  FileCheck
} from 'lucide-vue-next'

const stats = ref({
  totalUsers: 0,
  todayNewUsers: 0,
  totalProjects: 0,
  pendingProjects: 0,
  totalOrders: 0,
  todayRevenue: 0
})

const loading = ref(true)

// Config for stat cards
const statCards = [
  { 
    key: 'totalUsers', 
    label: '总用户数', 
    icon: Users, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    trend: '+12% 较上周' // Mock data for visual completeness
  },
  { 
    key: 'todayNewUsers', 
    label: '今日新增', 
    icon: UserPlus, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50',
    trend: '+5% 较昨日'
  },
  { 
    key: 'totalProjects', 
    label: '总项目数', 
    icon: FolderOpen, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50',
    trend: '+8% 较上月'
  },
  { 
    key: 'pendingProjects', 
    label: '待审核', 
    icon: FileClock, 
    color: 'text-orange-600', 
    bg: 'bg-orange-50',
    action: true
  },
  { 
    key: 'totalOrders', 
    label: '总订单数', 
    icon: ShoppingCart, 
    color: 'text-indigo-600', 
    bg: 'bg-indigo-50',
    trend: '+15% 较上月'
  },
  { 
    key: 'todayRevenue', 
    label: '今日收入', 
    icon: Banknote, 
    color: 'text-rose-600', 
    bg: 'bg-rose-50', 
    isCurrency: true,
    trend: '+23% 较昨日'
  }
]

const fetchDashboard = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/dashboard')
    if (response.data.success) {
      stats.value = response.data.data.stats
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
  } finally {
    // Artificial delay for smooth loading impression if too fast
    setTimeout(() => {
        loading.value = false
    }, 300)
  }
}

const formatValue = (value, isCurrency) => {
  if (value === undefined || value === null) return '--'
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
  <div class="space-y-8">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">仪表盘</h1>
        <p class="text-sm text-gray-500 mt-1">欢迎回来，查看今日概览</p>
      </div>
      <button 
        @click="fetchDashboard"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm group"
      >
        <RefreshCw :class="['w-4 h-4 transition-transform', loading ? 'animate-spin' : 'group-hover:rotate-180']" />
        <span>刷新数据</span>
      </button>
    </div>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="card in statCards" 
        :key="card.key"
        class="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] border border-gray-100 p-6 transition-all duration-300 group"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-gray-500 text-sm font-medium">{{ card.label }}</p>
            <div class="mt-2 flex items-baseline gap-2">
                <h3 v-if="loading" class="text-2xl font-bold text-gray-200 animate-pulse">...</h3>
                <h3 v-else class="text-2xl font-bold text-gray-900">
                    {{ formatValue(stats[card.key], card.isCurrency) }}
                </h3>
            </div>
            
             <!-- Trend mock -->
            <div v-if="!loading && card.trend" class="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                <TrendingUp class="w-3 h-3" />
                {{ card.trend }}
            </div>
             <div v-else-if="!loading && card.action" class="mt-2 h-5"></div>
          </div>
          
          <div :class="['p-3 rounded-lg transition-colors', card.bg, card.color]">
            <component :is="card.icon" class="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快捷操作 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-800">快捷操作</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <router-link 
          to="/projects/review"
          class="group p-6 hover:bg-gray-50 transition-colors flex flex-col items-center text-center"
        >
          <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <FileCheck class="w-6 h-6" />
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">审核项目</h3>
          <p class="text-sm text-gray-500 mb-3">查看待审核的项目申请</p>
           <span v-if="stats.pendingProjects > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            {{ stats.pendingProjects }} 待处理
          </span>
          <span v-else class="text-xs text-gray-400">暂无待办</span>
        </router-link>
        
        <router-link 
          to="/articles"
          class="group p-6 hover:bg-gray-50 transition-colors flex flex-col items-center text-center"
        >
            <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <FileEdit class="w-6 h-6" />
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">发布文章</h3>
          <p class="text-sm text-gray-500 mb-3">更新学院内容与资讯</p>
          <div class="flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            去发布 <ArrowRight class="w-4 h-4 ml-1" />
          </div>
        </router-link>
        
        <router-link 
          to="/users"
          class="group p-6 hover:bg-gray-50 transition-colors flex flex-col items-center text-center"
        >
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Users class="w-6 h-6" />
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">用户管理</h3>
          <p class="text-sm text-gray-500 mb-3">管理用户权限与状态</p>
           <div class="flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            查看用户 <ArrowRight class="w-4 h-4 ml-1" />
          </div>
        </router-link>
        
        <router-link 
          to="/analytics"
          class="group p-6 hover:bg-gray-50 transition-colors flex flex-col items-center text-center"
        >
          <div class="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <TrendingUp class="w-6 h-6" />
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">数据分析</h3>
          <p class="text-sm text-gray-500 mb-3">查看平台核心指标趋势</p>
           <div class="flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            查看详情 <ArrowRight class="w-4 h-4 ml-1" />
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

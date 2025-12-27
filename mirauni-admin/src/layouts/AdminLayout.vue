<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(true)

const menuItems = [
  { name: '仪表盘', icon: '📊', path: '/' },
  { name: '用户管理', icon: '👥', path: '/users' },
  { name: '项目审核', icon: '✅', path: '/projects/review' },
  { name: '项目管理', icon: '📁', path: '/projects' },
  { name: '文章管理', icon: '📝', path: '/articles' },
  { name: '订单管理', icon: '💰', path: '/orders' },
  { name: '数据分析', icon: '📈', path: '/analytics' }
]

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- 侧边栏 -->
    <aside 
      :class="[
        'bg-gray-900 text-white transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center border-b border-gray-800">
        <h1 v-if="sidebarOpen" class="text-xl font-bold">小概率管理后台</h1>
        <span v-else class="text-2xl">🎯</span>
      </div>
      
      <!-- 菜单 -->
      <nav class="p-4 space-y-2">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          active-class="bg-blue-600 hover:bg-blue-700"
        >
          <span class="text-xl">{{ item.icon }}</span>
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>
    
    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col">
      <!-- 顶部导航 -->
      <header class="h-16 bg-white shadow-sm flex items-center justify-between px-6">
        <button 
          @click="sidebarOpen = !sidebarOpen"
          class="p-2 hover:bg-gray-100 rounded-lg"
        >
          <span class="text-xl">☰</span>
        </button>
        
        <div class="flex items-center gap-4">
          <span class="text-gray-600">
            {{ authStore.admin?.username || '管理员' }}
          </span>
          <button 
            @click="handleLogout"
            class="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            退出登录
          </button>
        </div>
      </header>
      
      <!-- 页面内容 -->
      <main class="flex-1 p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

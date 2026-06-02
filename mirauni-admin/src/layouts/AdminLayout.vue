<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShoppingCart, 
  BarChart3, 
  FolderOpen, 
  FileCheck,
  Menu,
  LogOut,
  Target
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarOpen = ref(true)

const menuItems = [
  { name: '仪表盘', icon: LayoutDashboard, path: '/' },
  { name: '用户管理', icon: Users, path: '/users' },
  { name: '项目审核', icon: FileCheck, path: '/projects/review' },
  { name: '项目管理', icon: FolderOpen, path: '/projects' },
  { name: '文章管理', icon: FileText, path: '/articles' },
  { name: '订单管理', icon: ShoppingCart, path: '/orders' },
  { name: '数据分析', icon: BarChart3, path: '/analytics' }
]

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="h-screen bg-gray-50 flex overflow-hidden">
    <!-- 侧边栏 -->
    <aside 
      :class="[
        'bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out flex flex-col',
        sidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center border-b border-slate-800 flex-shrink-0">
        <div v-if="sidebarOpen" class="flex items-center gap-2 text-white">
          <Target class="w-6 h-6 text-blue-500" />
          <h1 class="text-lg font-bold tracking-wide">小概率后台</h1>
        </div>
        <Target v-else class="w-8 h-8 text-blue-500" />
      </div>
      
      <!-- 菜单 -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200"
          :class="[
            route.path === item.path 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'hover:bg-slate-800 hover:text-white'
          ]"
        >
          <component 
            :is="item.icon" 
            :size="20"
            :class="[
              route.path === item.path ? 'text-white' : 'text-slate-400 group-hover:text-white'
            ]" 
          />
          <span 
            v-show="sidebarOpen" 
            class="font-medium whitespace-nowrap overflow-hidden transition-all"
          >
            {{ item.name }}
          </span>
        </router-link>
      </nav>

      <!-- 底部信息 -->
      <div class="p-4 border-t border-slate-800">
         <div v-if="sidebarOpen" class="text-xs text-slate-500 text-center">
            &copy; 2024 Mirauni Admin
         </div>
      </div>
    </aside>
    
    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- 顶部导航 -->
      <header class="h-16 bg-white shadow-sm border-b border-gray-100 flex items-center justify-between px-6 z-10">
        <button 
          @click="sidebarOpen = !sidebarOpen"
          class="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
        >
          <Menu :size="20" />
        </button>
        
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3 pl-6 border-l border-gray-100">
            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              {{ authStore.admin?.username?.[0]?.toUpperCase() || 'A' }}
            </div>
            <div class="hidden md:block">
              <p class="text-sm font-medium text-gray-700">
                {{ authStore.admin?.username || '管理员' }}
              </p>
              
            </div>
            <button 
              @click="handleLogout"
              class="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="退出登录"
            >
              <LogOut :size="18" />
            </button>
          </div>
        </div>
      </header>
      
      <!-- 页面内容 -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
        <router-view v-slot="{ Component }">
          <transition 
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* 隐藏滚动条但保留功能 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent; 
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}
</style>

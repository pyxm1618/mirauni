<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { User, Lock, ArrowRight, Target, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    error.value = '请输入用户名和密码'
    return
  }
  
  loading.value = true
  error.value = ''
  
  // Simulate network delay for better UX feel
  await new Promise(resolve => setTimeout(resolve, 600))

  const result = await authStore.login(form.value.username, form.value.password)
  
  loading.value = false
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.message
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600 to-gray-50 -z-10 opacity-10"></div>
    <div class="absolute -top-20 -right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
    <div class="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <!-- Header -->
       <div class="pt-10 pb-6 px-8 text-center bg-white">
          <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
             <Target class="w-8 h-8 text-blue-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">欢迎回来</h1>
          <p class="text-sm text-gray-500 mt-2">请登录小概率管理后台</p>
       </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="p-8 pt-2 space-y-5">
        
         <!-- 错误提示 -->
        <transition 
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
            <div v-if="error" class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                <AlertCircle class="w-4 h-4 flex-shrink-0" />
                {{ error }}
            </div>
        </transition>

        <!-- 用户名 -->
        <div class="space-y-1.5">
          <label class="block text-sm font-semibold text-gray-700">用户名</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User class="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input 
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              class="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
            />
          </div>
        </div>
        
        <!-- 密码 -->
        <div class="space-y-1.5">
          <label class="block text-sm font-semibold text-gray-700">密码</label>
           <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock class="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input 
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              class="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
            />
          </div>
        </div>
        
        <div class="pt-2">
            <!-- 登录按钮 -->
            <button 
            type="submit"
            :disabled="loading"
            class="group w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg shadow-blue-900/10"
            >
            <span v-if="loading" class="animate-pulse">登录中...</span>
            <span v-else class="flex items-center gap-2">
                立即登录 <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            </button>
        </div>
      </form>
      
       <div class="bg-gray-50 px-8 py-4 border-t border-gray-100 flex items-center justify-center">
         <p class="text-xs text-center text-gray-400">
           &copy; 2024 Mirauni. All rights reserved.
         </p>
       </div>
    </div>
  </div>
</template>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
</style>

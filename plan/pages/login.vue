
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">
          钱途 Money Path
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          开启你的财富规划之旅
        </p>
      </div>

      <div class="space-y-4">
        <button 
          @click="loginWithWechat"
          :disabled="loading"
          class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#07C160] text-white rounded-lg font-bold hover:bg-[#06ae56] transition-colors shadow-sm disabled:opacity-50"
        >
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.133 0 .241-.108.241-.245 0-.06-.024-.12-.04-.177l-.325-1.233a.49.49 0 0 1 .178-.553c1.526-1.122 2.509-2.783 2.509-4.62 0-3.371-3.065-6.124-7.07-6.124zm-2.5 3.39c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.543.434-.982.97-.982zm5.002 0c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.543.434-.982.97-.982z"/>
          </svg>
          {{ loading ? '连接中...' : '微信一键登录' }}
        </button>

        <!-- 临时开发入口 -->
        <div v-if="devMode" class="pt-4 border-t">
            <button @click="devLogin" class="text-xs text-gray-400 hover:text-gray-600">Dev Login</button>
        </div>
      </div>

      <div v-if="error" class="text-center text-red-500 text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)
const error = ref('')
const route = useRoute()
const devMode = process.dev

onMounted(() => {
    if (route.query.error) {
        error.value = route.query.error as string
    }
})

async function loginWithWechat() {
  loading.value = true
  error.value = ''
  try {
    const { url } = await $fetch('/api/auth/wechat/url')
    if (url) {
      window.location.href = url
    }
  } catch (e: any) {
    error.value = e.message || '获取登录链接失败'
    loading.value = false
  }
}

function devLogin() {
    navigateTo('/dev/login')
}

// 监听 URL hash 中的 access_token (回调处理)
onMounted(async () => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
        loading.value = true
        const supabase = useSupabaseClient()
        
        // Helper to parse hash
        const params = new URLSearchParams(hash.substring(1)) // remove #
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        
        if (access_token && refresh_token) {
            const { error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token
            })
            if (!sessionError) {
                navigateTo('/')
            } else {
                error.value = '会话设置失败'
            }
        }
        loading.value = false
    }
})
</script>

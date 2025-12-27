<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white border-2 border-indie-border shadow-brutal-lg p-8">
      <h1 class="text-3xl font-display font-bold mb-2 text-center">绑定手机号</h1>
      <p class="text-gray-500 text-center mb-6">首次使用微信登录，请绑定手机号</p>
      
      <!-- 微信用户信息 -->
      <div v-if="wxNickname || wxAvatar" class="flex items-center gap-3 mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
        <img 
          v-if="wxAvatar" 
          :src="wxAvatar" 
          class="w-12 h-12 rounded-full border-2 border-indie-border"
        />
        <div v-else class="w-12 h-12 rounded-full bg-indie-secondary border-2 border-indie-border flex items-center justify-center text-xl">
          👤
        </div>
        <div>
          <p class="font-bold">{{ wxNickname || '微信用户' }}</p>
          <p class="text-sm text-gray-500">微信账号</p>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="mb-4 p-3 bg-red-50 border-2 border-red-300 text-red-600 text-sm">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 手机号 -->
        <div>
          <label class="block text-sm font-bold mb-2">手机号</label>
          <input 
            v-model="phone"
            type="tel" 
            placeholder="请输入手机号"
            class="w-full px-4 py-3 border-2 border-indie-border text-lg focus:outline-none focus:border-indie-text"
            maxlength="11"
          />
        </div>

        <!-- 验证码 -->
        <div>
          <label class="block text-sm font-bold mb-2">验证码</label>
          <div class="flex gap-2">
            <input 
              v-model="code"
              type="text" 
              placeholder="6位验证码"
              class="flex-1 px-4 py-3 border-2 border-indie-border text-lg tracking-widest focus:outline-none focus:border-indie-text"
              maxlength="6"
            />
            <button 
              type="button"
              @click="sendCode"
              :disabled="isSending || countdown > 0 || phone.length !== 11"
              class="px-4 py-3 border-2 border-indie-border bg-gray-50 hover:bg-gray-100 font-bold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ countdown > 0 ? `${countdown}秒` : (isSending ? '发送中...' : '获取验证码') }}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          :disabled="isSubmitting || phone.length !== 11 || code.length !== 6"
          class="w-full px-6 py-3 bg-indie-primary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-brutal disabled:hover:translate-x-0 disabled:hover:translate-y-0"
        >
          {{ isSubmitting ? '绑定中...' : '确认绑定' }}
        </button>
      </form>

      <p class="text-xs text-gray-400 text-center mt-6">
        绑定后可使用手机号或微信登录
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const authStore = useAuthStore()
const { sendSmsCode, bindPhone } = useAuth()

// 从 URL 解析微信信息
const wxDataStr = route.query.wx as string
const openid = route.query.openid as string

let wxData: any = null
if (wxDataStr) {
  try {
    wxData = JSON.parse(decodeURIComponent(wxDataStr))
  } catch (e) {
    console.error('解析微信数据失败:', e)
  }
}

const wxNickname = wxData?.nickname || ''
const wxAvatar = wxData?.avatar || ''
const wxOpenid = wxData?.openid || openid || ''

// 状态
const phone = ref('')
const code = ref('')
const error = ref('')
const isSending = ref(false)
const isSubmitting = ref(false)
const countdown = ref(0)

let countdownTimer: NodeJS.Timeout | null = null

// 检查必要参数
onMounted(() => {
  if (!wxOpenid) {
    error.value = '微信信息缺失，请重新登录'
  }
})

// 发送验证码
async function sendCode() {
  if (phone.value.length !== 11) {
    error.value = '请输入正确的手机号'
    return
  }

  error.value = ''
  isSending.value = true

  try {
    await sendSmsCode(phone.value)
    startCountdown()
  } catch (e: any) {
    error.value = e.data?.message || e.message || '发送验证码失败'
  } finally {
    isSending.value = false
  }
}

// 绑定手机号
async function handleSubmit() {
  if (!wxOpenid) {
    error.value = '微信信息缺失'
    return
  }

  error.value = ''
  isSubmitting.value = true

  try {
    const response = await bindPhone(phone.value, code.value, wxOpenid)
    
    if (response.success && response.session) {
      // 设置 session
      await supabase.auth.setSession({
        access_token: response.session.access_token,
        refresh_token: response.session.refresh_token
      })

      // 更新 store
      authStore.setUser(response.user)

      // 跳转
      await router.push('/')
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || '绑定失败'
  } finally {
    isSubmitting.value = false
  }
}

// 倒计时
function startCountdown() {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

useSeoMeta({
  title: '绑定手机号 - 小概率',
  robots: 'noindex'
})
</script>

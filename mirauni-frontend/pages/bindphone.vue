<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white border-2 border-indie-border shadow-brutal-lg p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
      <h1 class="text-3xl font-display font-black mb-4 text-center border-b-4 border-indie-accent inline-block mx-auto uppercase">BIND PHONE / 绑定手机</h1>
      <p class="text-gray-500 text-center mb-8 font-bold">Please bind your phone to continue.</p>
      
      <!-- 微信用户信息 -->
      <div v-if="wxNickname || wxAvatar" class="flex items-center gap-4 mb-8 p-4 bg-gray-50 border-3 border-black shadow-brutal-sm">
        <img 
          v-if="wxAvatar" 
          :src="wxAvatar" 
          class="w-16 h-16 rounded-full border-3 border-black"
        />
        <div v-else class="w-16 h-16 rounded-full bg-indie-secondary border-3 border-black flex items-center justify-center text-3xl">
          👤
        </div>
        <div>
          <p class="font-black text-lg">{{ wxNickname || 'WECHAT_USER' }}</p>
          <p class="text-sm text-gray-500 font-bold uppercase">CONNECTED ACCOUNT</p>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="mb-4 p-3 bg-red-100 border-3 border-red-500 text-red-600 font-bold uppercase text-sm">
        ERROR: {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 手机号 -->
        <div>
          <label class="block font-bold mb-2 uppercase text-sm tracking-wider">PHONE NUMBER</label>
          <input 
            v-model="phone"
            type="tel" 
            placeholder="ENTER PHONE NUMBER"
            class="w-full bg-gray-50 px-4 py-4 border-3 border-black font-bold text-lg focus:outline-none focus:shadow-brutal focus:bg-indie-secondary/20 transition-all placeholder-gray-400"
            maxlength="11"
          />
        </div>

        <!-- 验证码 -->
        <div>
          <label class="block font-bold mb-2 uppercase text-sm tracking-wider">VERIFICATION CODE</label>
          <div class="flex gap-4">
            <input 
              v-model="code"
              type="text" 
              placeholder="6-DIGIT CODE"
              class="flex-1 bg-gray-50 px-4 py-4 border-3 border-black font-bold text-lg tracking-widest focus:outline-none focus:shadow-brutal text-center"
              maxlength="6"
            />
            <button 
              type="button"
              @click="sendCode"
              :disabled="isSending || countdown > 0 || phone.length !== 11"
              class="px-6 py-4 border-3 border-black bg-black text-white hover:bg-indie-primary hover:text-black font-black uppercase whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-brutal hover:shadow-brutal-hover transition-all"
            >
              {{ countdown > 0 ? `${countdown}s` : (isSending ? 'SENDING...' : 'GET CODE') }}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          :disabled="isSubmitting || phone.length !== 11 || code.length !== 6"
          class="w-full px-6 py-4 bg-indie-primary border-3 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-black text-xl uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'BINDING...' : 'CONFIRM BINDING' }}
        </button>
      </form>
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

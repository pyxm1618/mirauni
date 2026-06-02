<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white border-2 border-indie-border shadow-brutal-lg p-8">
      <h1 class="text-4xl font-display font-black mb-8 border-b-4 border-indie-accent pb-2 inline-block">{{ $t('auth.register.title') }}</h1>
      <p class="mb-8 text-gray-500 font-medium">{{ $t('auth.register.subtitle') }}</p>
      
      <!-- 错误提示 -->
      <div v-if="error" class="mb-4 p-3 bg-red-50 border-2 border-red-300 text-red-600 text-sm">
        {{ error }}
      </div>

      <div class="space-y-4">
        <!-- 手机号输入 -->
        <div v-if="!showCodeInput">
          <div>
            <label class="block font-bold mb-2 uppercase text-sm tracking-wider">{{ $t('auth.phoneLabel') }}</label>
            <input 
              v-model="phone"
              type="tel" 
              :placeholder="$t('auth.phonePlaceholder')"
              class="w-full bg-gray-50 px-4 py-4 border-2 border-indie-border font-bold text-lg focus:outline-none focus:shadow-brutal focus:bg-indie-secondary/20 transition-all placeholder-gray-400"
              maxlength="11"
              @keyup.enter="handleSendCode"
            />
          </div>
          <button 
            @click="handleSendCode"
            :disabled="isSending || phone.length !== 11"
            class="mt-4 w-full px-6 py-4 bg-black text-white border-2 border-black shadow-brutal hover:bg-indie-primary hover:text-black hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSending ? $t('auth.sending') : $t('auth.sendCode') }}
          </button>
        </div>

        <!-- 验证码输入 -->
        <div v-else class="space-y-4">
          <div>
            <label class="block font-bold mb-2 uppercase text-sm tracking-wider">{{ $t('auth.codeLabel') }}</label>
            <input 
              v-model="code"
              type="text" 
              :placeholder="$t('auth.codePlaceholder')"
              class="w-full bg-gray-50 px-4 py-4 border-2 border-indie-border font-bold text-lg text-center tracking-widest focus:outline-none focus:shadow-brutal focus:bg-indie-secondary/20 transition-all"
              maxlength="6"
              @keyup.enter="handleRegister"
            />
            <div class="flex justify-between items-center mt-2">
              <p class="text-sm text-gray-500">{{ $t('auth.codeSent') }} {{ phone }}</p>
              <button 
                v-if="countdown > 0"
                disabled
                class="text-sm text-gray-400"
              >
                {{ countdown }}{{ $t('auth.resend') }}
              </button>
              <button 
                v-else
                @click="handleSendCode"
                class="text-sm text-indie-text hover:underline"
              >
                {{ $t('auth.resendBtn') }}
              </button>
            </div>
          </div>
          <button 
            @click="handleRegister"
            :disabled="isRegistering || code.length !== 6"
            class="w-full px-6 py-4 bg-black text-white border-2 border-black shadow-brutal hover:bg-indie-primary hover:text-black hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isRegistering ? $t('auth.register.registering') : $t('auth.register.registerBtn') }}
          </button>
          <button 
            @click="goBack"
            class="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            {{ $t('auth.back') }}
          </button>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="flex items-center gap-4 my-6">
        <div class="flex-1 h-px bg-gray-300"></div>
        <span class="text-gray-400 text-sm">{{ $t('auth.or') }}</span>
        <div class="flex-1 h-px bg-gray-300"></div>
      </div>

      <!-- 微信登录 -->
      <button 
        @click="handleWechatLogin"
        :disabled="isWechatLoading"
        class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#07C160] text-white border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold disabled:opacity-50"
      >
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.133 0 .241-.108.241-.245 0-.06-.024-.12-.04-.177l-.325-1.233a.49.49 0 0 1 .178-.553c1.526-1.122 2.509-2.783 2.509-4.62 0-3.371-3.065-6.124-7.07-6.124zm-2.5 3.39c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.543.434-.982.97-.982zm5.002 0c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.543.434-.982.97-.982z"/>
        </svg>
        {{ isWechatLoading ? $t('auth.wechatLoading') : $t('auth.wechatLogin') }}
      </button>

      <!-- 登录引导 -->
      <div class="mt-6 text-center">
        <span class="text-gray-500">{{ $t('auth.hasAccount') }}</span>
        <NuxtLink to="/login" class="ml-2 font-bold text-indie-primary underline hover:text-indie-accent transition-colors">
          {{ $t('auth.goLogin') }}
        </NuxtLink>
      </div>

      <!-- 协议 -->
      <p class="text-xs text-gray-400 text-center mt-6">
        {{ $t('auth.agreement') }}
        <NuxtLink to="/terms" class="text-indie-text underline">{{ $t('auth.userProtocol') }}</NuxtLink>
        {{ $t('auth.and') }}
        <NuxtLink to="/privacy" class="text-indie-text underline">{{ $t('auth.privacyPolicy') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { sendSmsCode, loginWithCode, getWechatLoginUrl } = useAuth()
const { t } = useI18n()

// 状态
const phone = ref('')
const code = ref('')
const showCodeInput = ref(false)
const error = ref('')
const isSending = ref(false)
const isRegistering = ref(false)
const isWechatLoading = ref(false)
const countdown = ref(0)

let countdownTimer: NodeJS.Timeout | null = null

// 发送验证码
async function handleSendCode() {
  if (phone.value.length !== 11) {
    error.value = t('auth.error.phone')
    return
  }

  error.value = ''
  isSending.value = true

  try {
    await sendSmsCode(phone.value)
    showCodeInput.value = true
    startCountdown()
  } catch (e: any) {
    error.value = e.data?.message || e.message || t('auth.error.sendFailed')
  } finally {
    isSending.value = false
  }
}

// 注册（复用验证码登录流程）
async function handleRegister() {
  if (code.value.length !== 6) {
    error.value = t('auth.error.code')
    return
  }
  
  error.value = ''
  isRegistering.value = true

  try {
    await loginWithCode(phone.value, code.value)
  } catch (e: any) {
    error.value = e.data?.message || e.message || t('auth.error.loginFailed')
  } finally {
    isRegistering.value = false
  }
}

// 微信登录
async function handleWechatLogin() {
  isWechatLoading.value = true
  error.value = ''

  try {
    const url = await getWechatLoginUrl()
    if (url) {
      window.location.href = url
    } else {
      error.value = t('auth.wechatUnavailable') || 'WeChat login unavailable'
    }
  } catch (e: any) {
    error.value = e.data?.message || t('auth.error.wechatFailed')
  } finally {
    isWechatLoading.value = false
  }
}

function goBack() {
  showCodeInput.value = false
  code.value = ''
  error.value = ''
  stopCountdown()
}

function startCountdown() {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      stopCountdown()
    }
  }, 1000)
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  countdown.value = 0
}

onUnmounted(() => {
  stopCountdown()
})

useSeoMeta({
  title: () => `${t('auth.register.title')} - ${t('common.appName')}`,
  description: 'Register for Mirauni'
})
</script>

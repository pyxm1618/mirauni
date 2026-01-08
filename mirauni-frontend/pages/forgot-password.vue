<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white border-2 border-indie-border shadow-brutal-lg p-8">
      <h1 class="text-3xl font-display font-black mb-8 border-b-4 border-indie-accent pb-2 inline-block">{{ $t('auth.forgot.title') }}</h1>
      
      <!-- 错误提示 -->
      <div v-if="error" class="mb-4 p-3 bg-red-50 border-2 border-red-300 text-red-600 text-sm">
        {{ error }}
      </div>

      <!-- 成功提示 -->
      <div v-if="success" class="mb-4 p-3 bg-green-50 border-2 border-green-300 text-green-600 text-sm">
        {{ $t('auth.forgot.success') }}
      </div>

      <div v-if="!success" class="space-y-6">
        <!-- Step 1: 验证手机号 -->
        <div v-if="step === 1" class="space-y-4">
          <p class="font-bold text-lg mb-4">{{ $t('auth.forgot.step1') }}</p>
          
          <div>
            <label class="block font-bold mb-2 uppercase text-sm tracking-wider">{{ $t('auth.phoneLabel') }}</label>
            <input 
              v-model="phone"
              type="tel" 
              :placeholder="$t('auth.phonePlaceholder')"
              class="w-full bg-gray-50 px-4 py-4 border-2 border-indie-border font-bold text-lg focus:outline-none focus:shadow-brutal focus:bg-indie-secondary/20 transition-all placeholder-gray-400"
              maxlength="11"
            />
          </div>

          <div>
            <label class="block font-bold mb-2 uppercase text-sm tracking-wider">{{ $t('auth.codeLabel') }}</label>
            <div class="flex gap-2">
              <input 
                v-model="code"
                type="text" 
                :placeholder="$t('auth.codePlaceholder')"
                class="flex-1 bg-gray-50 px-4 py-4 border-2 border-indie-border font-bold text-lg text-center tracking-widest focus:outline-none focus:shadow-brutal focus:bg-indie-secondary/20 transition-all"
                maxlength="6"
              />
              <button 
                @click="handleSendCode"
                :disabled="isSending || phone.length !== 11 || countdown > 0"
                class="w-32 px-2 bg-black text-white border-2 border-black font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ countdown > 0 ? `${countdown}s` : $t('auth.sendCode') }}
              </button>
            </div>
          </div>

          <button 
            @click="handleNextStep"
            :disabled="!phone || code.length !== 6"
            class="w-full px-6 py-4 bg-black text-white border-2 border-black shadow-brutal hover:bg-indie-primary hover:text-black hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ $t('auth.forgot.nextStep') }}
          </button>
        </div>

        <!-- Step 2: 设置新密码 -->
        <div v-else class="space-y-4">
          <p class="font-bold text-lg mb-4">{{ $t('auth.forgot.step2') }}</p>
          
          <div>
            <label class="block font-bold mb-2 uppercase text-sm tracking-wider">{{ $t('auth.forgot.newPassword') }}</label>
            <input 
              v-model="newPassword"
              type="password" 
              :placeholder="$t('auth.forgot.newPasswordPlaceholder')"
              class="w-full bg-gray-50 px-4 py-4 border-2 border-indie-border font-bold text-lg focus:outline-none focus:shadow-brutal focus:bg-indie-secondary/20 transition-all placeholder-gray-400"
            />
          </div>

          <div>
            <label class="block font-bold mb-2 uppercase text-sm tracking-wider">{{ $t('auth.forgot.confirmPassword') }}</label>
            <input 
              v-model="confirmPassword"
              type="password" 
              :placeholder="$t('auth.forgot.confirmPasswordPlaceholder')"
              class="w-full bg-gray-50 px-4 py-4 border-2 border-indie-border font-bold text-lg focus:outline-none focus:shadow-brutal focus:bg-indie-secondary/20 transition-all placeholder-gray-400"
            />
          </div>

          <button 
            @click="handleReset"
            :disabled="isResetting || !newPassword || !confirmPassword"
            class="w-full px-6 py-4 bg-black text-white border-2 border-black shadow-brutal hover:bg-indie-primary hover:text-black hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isResetting ? $t('auth.forgot.resetting') : $t('auth.forgot.resetBtn') }}
          </button>
          
          <button 
            @click="step = 1"
            class="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            {{ $t('auth.back') }}
          </button>
        </div>
      </div>

      <!-- 返回登录 -->
      <div class="mt-8 text-center border-t-2 border-gray-100 pt-6">
        <NuxtLink to="/login" class="font-bold text-indie-text hover:underline">
          {{ $t('auth.forgot.backToLogin') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { sendSmsCode, resetPassword } = useAuth()
const { t } = useI18n()
const router = useRouter()

// 状态
const step = ref(1)
const phone = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const isSending = ref(false)
const isResetting = ref(false)
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
    startCountdown()
  } catch (e: any) {
    error.value = e.data?.message || e.message || t('auth.error.sendFailed')
  } finally {
    isSending.value = false
  }
}

// 下一步
function handleNextStep() {
  if (code.value.length !== 6) {
    error.value = t('auth.error.code')
    return
  }
  error.value = ''
  step.value = 2
}

// 重置密码
async function handleReset() {
  if (newPassword.value.length < 6) {
    error.value = t('auth.error.passwordMin')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = t('auth.error.passwordMismatch')
    return
  }

  error.value = ''
  isResetting.value = true

  try {
    await resetPassword(phone.value, code.value, newPassword.value)
    success.value = true
    
    // 3秒后跳转登录页
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (e: any) {
    error.value = e.data?.message || e.message || t('auth.error.resetFailed')
  } finally {
    isResetting.value = false
  }
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
  title: () => `${t('auth.forgot.title')} - ${t('common.appName')}`,
  description: 'Reset Password'
})
</script>

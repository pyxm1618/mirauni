<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white border-2 border-indie-border shadow-brutal-lg p-8">
      <h1 class="text-3xl font-display font-black mb-8 border-b-4 border-indie-accent pb-2 inline-block">
        {{ isInitial ? $t('auth.settings.setPassword') : $t('auth.settings.changePassword') }}
      </h1>
      
      <!-- 提示信息 -->
      <div v-if="isInitial" class="mb-6 p-3 bg-yellow-50 border-2 border-yellow-200 text-yellow-800 text-sm">
        {{ $t('auth.settings.initialTip') }}
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="mb-4 p-3 bg-red-50 border-2 border-red-300 text-red-600 text-sm">
        {{ error }}
      </div>

      <!-- 成功提示 -->
      <div v-if="success" class="mb-4 p-3 bg-green-50 border-2 border-green-300 text-green-600 text-sm">
        {{ $t('auth.settings.success') }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="block font-bold mb-2 uppercase text-sm tracking-wider">{{ $t('auth.forgot.newPassword') }}</label>
          <input 
            v-model="password"
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
          @click="handleSubmit"
          :disabled="isSubmitting || !password || !confirmPassword"
          class="w-full px-6 py-4 bg-black text-white border-2 border-black shadow-brutal hover:bg-indie-primary hover:text-black hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? $t('common.saving') : $t('common.confirm') }}
        </button>

        <button 
          v-if="!isInitial"
          @click="router.back()"
          class="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          {{ $t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// 是否是强制初始化密码
const isInitial = computed(() => route.query.initial === 'true')

const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const isSubmitting = ref(false)

async function handleSubmit() {
  if (password.value.length < 6) {
    error.value = t('auth.error.passwordMin')
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = t('auth.error.passwordMismatch')
    return
  }

  error.value = ''
  isSubmitting.value = true

  try {
    await $fetch('/api/auth/set-password', {
      method: 'POST',
      body: { password: password.value }
    })
    
    success.value = true
    
    setTimeout(() => {
      // 如果是初始化流程，跳转首页；否则返回上一页
      if (isInitial.value) {
        router.push('/')
      } else {
        router.back()
      }
    }, 1500)
  } catch (e: any) {
    error.value = e.data?.message || e.message || '设置失败'
  } finally {
    isSubmitting.value = false
  }
}

useSeoMeta({
  title: () => `${isInitial.value ? t('auth.settings.setPassword') : t('auth.settings.changePassword')} - ${t('common.appName')}`,
  description: 'Set Password'
})

definePageMeta({
  middleware: 'auth'
})
</script>

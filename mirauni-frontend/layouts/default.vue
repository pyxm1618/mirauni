<template>
  <!-- 顶部导航 -->
  <header class="sticky top-0 z-50 bg-indie-bg border-b-2 border-indie-border">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-20">
        <div class="flex items-center gap-10">
          <!-- Logo & Brand -->
          <NuxtLink to="/" class="flex items-center gap-3 group">
            <div class="flex items-center justify-center w-12 h-12 bg-indie-primary border-2 border-indie-border shadow-brutal group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-brutal-hover group-active:translate-x-[4px] group-active:translate-y-[4px] group-active:shadow-brutal-active transition-all overflow-hidden p-1">
               <img src="/logo.png" :alt="$t('common.appName')" class="w-full h-full object-contain" />
            </div>
            <span class="text-2xl font-black font-display tracking-wide group-hover:text-indie-secondary transition-colors hidden sm:block">
              {{ $t('common.appName') }}
            </span>
          </NuxtLink>

          <!-- 桌面端导航 -->
          <nav class="hidden md:flex items-center gap-8">
            <NuxtLink to="/projects" class="font-bold tracking-wide hover:text-indie-secondary transition-colors uppercase">{{ $t('nav.projects') }}</NuxtLink>
            <NuxtLink to="/developers" class="font-bold tracking-wide hover:text-indie-secondary transition-colors uppercase">{{ $t('nav.developers') }}</NuxtLink>
            <NuxtLink :to="planUrl" class="font-bold tracking-wide hover:text-indie-secondary transition-colors uppercase text-indie-text">{{ $t('nav.plan') }}</NuxtLink>
            <NuxtLink to="/finance" class="font-bold tracking-wide hover:text-indie-secondary transition-colors uppercase">{{ $t('nav.finance') }}</NuxtLink>
            <NuxtLink to="/academy" class="font-bold tracking-wide hover:text-indie-secondary transition-colors uppercase">{{ $t('nav.academy') }}</NuxtLink>
          </nav>
        </div>

        <!-- 用户区域 -->
        <div class="flex items-center gap-6">
          <LanguageSwitcher />
          
          <!-- 未登录 -->
          <template v-if="!user">
            <NuxtLink to="/login" class="font-bold hover:underline uppercase">
              {{ $t('common.login') }}
            </NuxtLink>
            <NuxtLink 
              to="/login" 
              class="px-6 py-2 bg-indie-secondary border-2 border-indie-border shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-hover active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-bold uppercase"
            >
              {{ $t('common.join') }}
            </NuxtLink>
          </template>

          <!-- 已登录 -->
          <template v-else>
            <NuxtLink to="/me/messages" class="relative flex items-center justify-center w-10 h-10 bg-white border-2 border-indie-border shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-hover active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all">
              <UIcon name="i-heroicons-chat-bubble-left-right-solid" class="w-5 h-5 text-black" />
              <span v-if="unreadCount > 0" class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 border-2 border-black text-white text-xs font-bold leading-none flex items-center justify-center">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </NuxtLink>
            <NuxtLink to="/me" class="w-10 h-10 bg-indie-secondary border-2 border-indie-border rounded-full flex items-center justify-center shadow-brutal hover:shadow-brutal-hover transition-all">
              👤
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </header>

  <!-- 页面内容 -->
  <main class="min-h-screen pb-20 md:pb-0">
    <slot />
  </main>

  <!-- 移动端底部导航 -->
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-indie-border md:hidden pb-safe-bottom z-50">
    <div class="flex justify-around py-2">
      <NuxtLink to="/" class="flex flex-col items-center gap-1 px-4 py-2">
        <span class="text-xl">🏠</span>
        <span class="text-xs">{{ $t('nav.home') }}</span>
      </NuxtLink>
      <NuxtLink to="/projects" class="flex flex-col items-center gap-1 px-4 py-2">
        <span class="text-xl">📁</span>
        <span class="text-xs">{{ $t('nav.projects') }}</span>
      </NuxtLink>
      <NuxtLink :to="planUrl" class="flex flex-col items-center gap-1 px-4 py-2 text-indie-text">
        <span class="text-xl">🎯</span>
        <span class="text-xs">{{ $t('nav.plan') }}</span>
      </NuxtLink>
      <NuxtLink to="/developers" class="flex flex-col items-center gap-1 px-4 py-2">
        <span class="text-xl">👥</span>
        <span class="text-xs">{{ $t('nav.developers') }}</span>
      </NuxtLink>
      <NuxtLink to="/finance" class="flex flex-col items-center gap-1 px-4 py-2">
        <span class="text-xl">💰</span>
        <span class="text-xs">{{ $t('nav.finance') }}</span>
      </NuxtLink>
      <NuxtLink to="/me" class="flex flex-col items-center gap-1 px-4 py-2">
        <span class="text-xl">👤</span>
        <span class="text-xs">{{ $t('nav.profile') }}</span>
      </NuxtLink>
    </div>
  </nav>

  <!-- 页脚 -->
  <footer class="hidden md:block bg-white border-t-2 border-indie-border py-8">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3">
           <img src="/logo.png" alt="小概率" class="w-8 h-8 object-contain" />
          <span class="font-bold text-lg">小概率</span>
          <span class="text-gray-500 text-sm hidden sm:inline-block">{{ $t('footer.slogan') }}</span>
        </div>
        <div class="flex gap-6 text-sm text-gray-500">
          <NuxtLink to="/about" class="hover:text-indie-secondary transition-colors">{{ $t('footer.about') }}</NuxtLink>
          <NuxtLink to="/terms" class="hover:text-indie-secondary transition-colors">{{ $t('footer.terms') }}</NuxtLink>
          <NuxtLink to="/privacy" class="hover:text-indie-secondary transition-colors">{{ $t('footer.privacy') }}</NuxtLink>
          <NuxtLink to="/contact" class="hover:text-indie-secondary transition-colors">{{ $t('footer.contact') }}</NuxtLink>
        </div>
        <div class="flex flex-col items-end gap-1 text-sm text-gray-400">
          <div>© 2025 {{ $t('common.appName') }} mirauni.com</div>
          <a href="https://beian.miit.gov.cn/" target="_blank" class="hover:text-indie-secondary transition-colors text-xs">{{ $t('footer.icp') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { unreadCount, fetchUnreadCount } = useMessages()

// 根据环境设置钱途 URL
const isDev = import.meta.dev
const planBaseUrl = isDev ? 'http://localhost:3002' : 'https://plan.mirauni.com'

// SSO: 如果已登录，将 access_token 传递给钱途
const ssoToken = ref('')

onMounted(async () => {
    if (user.value) {
        const { data } = await supabase.auth.getSession()
        if (data.session?.access_token) {
            ssoToken.value = data.session.access_token
        }
    }
})

const planUrl = computed(() => {
    if (ssoToken.value) {
        return `${planBaseUrl}?sso_token=${encodeURIComponent(ssoToken.value)}`
    }
    return planBaseUrl
})

onMounted(() => {
  if (user.value) {
    fetchUnreadCount()
  }
})

watch(user, (newUser) => {
  if (newUser) {
    fetchUnreadCount()
  }
})

</script>

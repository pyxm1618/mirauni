<template>
  <!-- 顶部导航 -->
  <header class="sticky top-0 z-50 bg-indie-bg border-b-2 border-indie-border">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-20">
        <div class="flex items-center gap-10">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center justify-center w-12 h-12 bg-indie-primary border-2 border-indie-border shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-hover active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all">
            <span class="text-2xl font-bold font-display">M</span>
          </NuxtLink>

          <!-- 桌面端导航 -->
          <nav class="hidden md:flex items-center gap-8">
            <NuxtLink to="/projects" class="font-bold tracking-wide hover:text-indie-secondary transition-colors uppercase">PROJECTS</NuxtLink>
            <NuxtLink to="/developers" class="font-bold tracking-wide hover:text-indie-secondary transition-colors uppercase">TALENT</NuxtLink>
            <NuxtLink to="/academy" class="font-bold tracking-wide hover:text-indie-secondary transition-colors uppercase">ACADEMY</NuxtLink>
          </nav>
        </div>

        <!-- 用户区域 -->
        <div class="flex items-center gap-6">
          <!-- 未登录 -->
          <template v-if="!user">
            <NuxtLink to="/login" class="font-bold hover:underline">
              LOG IN
            </NuxtLink>
            <NuxtLink 
              to="/login" 
              class="px-6 py-2 bg-indie-secondary border-2 border-indie-border shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-hover active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-bold"
            >
              JOIN NOW
            </NuxtLink>
          </template>

          <!-- 已登录 -->
          <template v-else>
            <NuxtLink to="/me/messages" class="relative p-2 hover:bg-white rounded-lg transition-colors">
              <span class="text-xl">💬</span>
              <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
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
        <span class="text-xs">首页</span>
      </NuxtLink>
      <NuxtLink to="/projects" class="flex flex-col items-center gap-1 px-4 py-2">
        <span class="text-xl">📁</span>
        <span class="text-xs">项目</span>
      </NuxtLink>
      <NuxtLink to="/developers" class="flex flex-col items-center gap-1 px-4 py-2">
        <span class="text-xl">👥</span>
        <span class="text-xs">开发者</span>
      </NuxtLink>
      <NuxtLink to="/me" class="flex flex-col items-center gap-1 px-4 py-2">
        <span class="text-xl">👤</span>
        <span class="text-xs">我的</span>
      </NuxtLink>
    </div>
  </nav>

  <!-- 页脚 -->
  <footer class="hidden md:block bg-white border-t-2 border-indie-border py-8">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-xl">🎲</span>
          <span class="font-bold">小概率</span>
          <span class="text-gray-500">独立开发者找合伙人的第一站</span>
        </div>
        <div class="flex gap-6 text-sm text-gray-500">
          <a href="#">关于我们</a>
          <a href="#">用户协议</a>
          <a href="#">隐私政策</a>
          <a href="#">联系我们</a>
        </div>
        <div class="text-sm text-gray-400">
          © 2025 小概率 mirauni.com
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const { unreadCount, fetchUnreadCount } = useMessages()

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

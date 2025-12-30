<template>
  <div class="min-h-screen bg-toon-50 flex font-sans text-gray-900">
    <!-- Sidebar -->
    <aside class="w-64 border-r-3 border-black bg-white flex-shrink-0 flex flex-col fixed h-full z-20">
      <div class="h-16 border-b-3 border-black flex items-center px-4 bg-toon-500 text-white">
        <span class="text-xl font-bold tracking-tight">钱途 MoneyPath</span>
      </div>
      
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <NuxtLink to="/" class="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-transparent hover:border-black hover:bg-toon-100 transition-all font-bold">
          <UIcon name="i-lucide-rocket" class="w-5 h-5" />
          <span>开始规划</span>
        </NuxtLink>
        <NuxtLink to="/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-transparent hover:border-black hover:bg-toon-100 transition-all font-bold">
          <UIcon name="i-lucide-layout-dashboard" class="w-5 h-5" />
          <span>执行看板</span>
        </NuxtLink>
        <NuxtLink to="/calendar" class="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-transparent hover:border-black hover:bg-toon-100 transition-all font-bold">
          <UIcon name="i-lucide-calendar" class="w-5 h-5" />
          <span>日历视图</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t-3 border-black bg-gray-50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full border-2 border-black bg-gray-300 overflow-hidden">
             <!-- Avatar Placeholder -->
             <img v-if="userInfo?.avatarUrl" :src="userInfo.avatarUrl" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold truncate">{{ userInfo?.nickname || 'Guest' }}</p>
            <p class="text-xs text-gray-500 truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
      <!-- Top Bar -->
      <header class="h-16 border-b-3 border-black bg-white flex items-center justify-end px-6 sticky top-0 z-30">
         <AppSwitcher />
      </header>

      <!-- Page Content -->
      <div class="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { userInfo } = useUser()
</script>

<style>
/* Global scrollbar styling for a rough look */
::-webkit-scrollbar {
  width: 12px;
}
::-webkit-scrollbar-track {
  background: #fff;
  border-left: 3px solid #000;
}
::-webkit-scrollbar-thumb {
  background: #000;
  border: 3px solid #fff;
}
</style>

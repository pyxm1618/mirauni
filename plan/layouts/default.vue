<template>
  <div class="min-h-screen bg-toon-50 flex flex-col font-sans text-gray-900">
    <!-- Top Bar -->
    <header class="h-16 border-b-3 border-black bg-white sticky top-0 z-30 flex-shrink-0">
      <div class="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Logo / Title -->
          <NuxtLink to="/" class="flex items-center gap-2 group">
              <div class="w-8 h-8 bg-black text-white rounded flex items-center justify-center font-black text-lg group-hover:rotate-12 transition-transform">M</div>
              <span class="text-xl font-bold tracking-tight">钱途 MoneyPath</span>
          </NuxtLink>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- User Profile / Login -->
          <ClientOnly>
              <UDropdown 
                v-if="user" 
                :items="items" 
                :popper="{ placement: 'bottom-end', offsetDistance: 12 }"
                :ui="{
                  width: 'w-56',
                  background: 'bg-white',
                  ring: 'ring-3 ring-black',
                  shadow: 'shadow-[6px_6px_0px_0px_#000]',
                  rounded: 'rounded-xl',
                  padding: 'p-2',
                  item: {
                    padding: 'px-3 py-3',
                    base: 'font-bold transition-colors',
                    active: 'bg-black text-white',
                    inactive: 'text-black',
                    icon: {
                      base: 'flex-shrink-0 h-5 w-5',
                      active: 'text-white',
                      inactive: 'text-black'
                    }
                  },
                  divide: 'divide-y-3 divide-gray-100'
                }"
              >
                  <div class="flex items-center gap-3 cursor-pointer group">
                      <div class="text-right hidden sm:block">
                          <p class="font-bold text-sm leading-tight group-hover:underline">{{ user.user_metadata?.nickname || 'User' }}</p>
                          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">LEVEL 1</p>
                      </div>
                      <div class="w-9 h-9 rounded-full border-2 border-black bg-gray-200 overflow-hidden group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_#000]">
                          <img v-if="user.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" class="w-full h-full object-cover" />
                          <div v-else class="w-full h-full flex items-center justify-center font-black text-gray-400">?</div>
                      </div>
                  </div>
              </UDropdown>
              <div v-else>
                  <UButton to="/login" color="black" variant="solid" size="sm" class="font-bold px-4">登录</UButton>
              </div>
          </ClientOnly>
        </div>
      </div>
    </header>

    <!-- Main Content (Full Width) -->
    <main class="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user } = useUser() // Assuming useUser exposes clear/logout
const client = useSupabaseClient()

const items = [
  [{
    label: '个人档案',
    icon: 'i-lucide-user',
    click: () => navigateTo('/wizard/profile')
  }],
  [{
    label: '规划设置',
    icon: 'i-lucide-settings',
    click: () => navigateTo('/dashboard/settings')
  }],
  [{
    label: '退出登录',
    icon: 'i-lucide-log-out',
    click: async () => {
        await client.auth.signOut()
        // Force reload or navigate to home
        window.location.href = '/'
    }
  }]
]
</script>

<style>
/* Global scrollbar styling */
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
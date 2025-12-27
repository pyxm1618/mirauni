<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-display font-bold">我的私信</h1>
    </div>

    <div v-if="pending" class="flex justify-center py-12">
      <div class="animate-spin text-4xl">🎲</div>
    </div>

    <div v-else-if="error" class="text-center py-12 text-red-500">
      加载失败，请稍后重试
    </div>

    <div v-else-if="conversations.length === 0" class="text-center py-12 bg-white border-2 border-indie-border shadow-brutal rounded-xl">
      <div class="text-6xl mb-4">📭</div>
      <h3 class="text-xl font-bold mb-2">暂无消息</h3>
      <p class="text-gray-500">去发现有趣的开发者和项目吧</p>
      <div class="mt-6 flex justify-center gap-4">
        <NuxtLink to="/developers" class="px-6 py-2 bg-indie-primary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover transition-all font-bold">
          找开发者
        </NuxtLink>
        <NuxtLink to="/projects" class="px-6 py-2 bg-white border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover transition-all font-bold">
          看项目
        </NuxtLink>
      </div>
    </div>

    <div v-else class="space-y-4">
      <NuxtLink 
        v-for="conv in conversations" 
        :key="conv.id"
        :to="`/me/messages/${conv.id}`"
        class="block bg-white border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover transition-all rounded-xl p-4"
      >
        <div class="flex items-center gap-4">
          <!-- Avatar -->
          <img 
            :src="conv.otherUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + conv.otherUser.username" 
            :alt="conv.otherUser.username"
            class="w-12 h-12 rounded-full border-2 border-indie-border bg-gray-100 object-cover"
          >
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-bold truncate">{{ conv.otherUser.username }}</h3>
              <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-indie-border">
                {{ formatTime(conv.updatedAt) }}
              </span>
            </div>
            
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600 truncate max-w-[80%]">
                {{ conv.lastMessage?.content || '暂无消息' }}
              </p>
              <div v-if="conv.lastMessage?.is_read === false && conv.lastMessage?.from_user_id === conv.otherUser.id" class="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { data: result, pending, error } = await useFetch('/api/messages/conversations')
const conversations = computed(() => result.value?.data || [])

const formatTime = (isoString?: string) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-5xl font-black font-display mb-12 uppercase">MY MESSAGES</h1>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- 侧边栏 -->
      <aside class="lg:col-span-1">
        <nav class="bg-white border-3 border-black shadow-brutal sticky top-8">
          <NuxtLink to="/me" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
            PROFILE
          </NuxtLink>
           <NuxtLink to="/me/projects" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
            MY PROJECTS
          </NuxtLink>
          <NuxtLink to="/me/messages" class="block px-6 py-4 border-b-3 border-black font-black uppercase bg-indie-primary hover:bg-indie-accent transition-colors">
            MESSAGES / 消息
          </NuxtLink>
          <NuxtLink to="/me/recharge" class="block px-6 py-4 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
            RECHARGE
          </NuxtLink>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="lg:col-span-3">
        <div v-if="pending" class="flex justify-center py-20">
          <div class="text-4xl font-black uppercase animate-pulse">LOADING INBOX...</div>
        </div>

        <div v-else-if="error" class="text-center py-20 bg-red-100 border-3 border-black font-bold uppercase text-red-600">
          FAILED TO LOAD MESSAGES
        </div>

        <div v-else-if="conversations.length === 0" class="text-center py-20 bg-white border-3 border-black shadow-brutal">
          <div class="text-8xl mb-6 grayscale opacity-20 font-black">/</div>
          <h3 class="text-2xl font-black uppercase mb-4">NO MESSAGES YET</h3>
          <p class="text-gray-500 font-bold uppercase mb-8">START CONNECTING WITH OTHERS</p>
          <div class="flex justify-center gap-6">
            <NuxtLink to="/developers" class="px-8 py-3 bg-indie-primary border-3 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-hover active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-black uppercase">
              FIND TALENT
            </NuxtLink>
            <NuxtLink to="/projects" class="px-8 py-3 bg-white border-3 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-hover active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-black uppercase">
              EXPLORE PROJECTS
            </NuxtLink>
          </div>
        </div>

        <div v-else class="space-y-6">
          <NuxtLink 
            v-for="conv in conversations" 
            :key="conv.id"
            :to="`/me/messages/${conv.id}`"
            class="block bg-white border-3 border-black shadow-brutal hover:shadow-brutal-hover hover:-translate-y-1 transition-all p-6 group"
          >
            <div class="flex items-center gap-6">
              <!-- Avatar -->
              <img 
                :src="conv.otherUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + conv.otherUser.username" 
                :alt="conv.otherUser.username"
                class="w-16 h-16 rounded-full border-3 border-black bg-gray-100 object-cover shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-2xl font-black uppercase truncate group-hover:text-indie-secondary transition-colors">{{ conv.otherUser.username }}</h3>
                  <span class="text-xs font-bold font-mono bg-black text-white px-2 py-1 mb-1">
                    {{ formatTime(conv.updatedAt) }}
                  </span>
                </div>
                
                <div class="flex items-center justify-between">
                  <p class="text-lg font-bold text-gray-600 truncate max-w-[80%]">
                    {{ conv.lastMessage?.content || 'NO CONTENT' }}
                  </p>
                  <div v-if="conv.lastMessage?.is_read === false && conv.lastMessage?.from_user_id === conv.otherUser.id" class="w-4 h-4 bg-red-600 border-2 border-black"></div>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface Message {
  content: string
  is_read: boolean
  from_user_id: string
}

interface Conversation {
  id: string
  updatedAt: string
  otherUser: {
    id: string
    username: string
    avatar_url: string
  }
  lastMessage: Message
}

const { data: result, pending, error } = await useFetch<{ data: Conversation[] }>('/api/messages/conversations')
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

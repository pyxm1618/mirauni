<template>
  <div class="h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] flex flex-col bg-indie-bg">
    <!-- Header -->
    <div class="bg-white border-b-3 border-black px-6 py-4 flex items-center gap-4 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)] z-10">
      <NuxtLink to="/me/messages" class="md:hidden text-2xl font-black mr-2 hover:translate-x-[-2px] transition-transform">←</NuxtLink>
      <template v-if="otherUser">
        <img 
          :src="otherUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + otherUser.username" 
          :alt="otherUser.username"
          class="w-12 h-12 rounded-full border-3 border-black bg-gray-100 shadow-sm"
        >
        <div>
          <h2 class="font-black text-xl uppercase tracking-wide">{{ otherUser.username }}</h2>
          <span class="text-xs font-bold font-mono bg-green-500 text-black px-2 py-0.5 border-2 border-black inline-flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
            ONLINE
          </span>
        </div>
      </template>
    </div>

    <!-- Messages Area -->
    <div ref="messageContainer" class="flex-1 overflow-y-auto p-6 space-y-6">
      <div v-if="pending" class="flex justify-center py-8">
        <div class="text-2xl font-black uppercase animate-pulse">LOADING...</div>
      </div>

      <template v-else>
        <div 
          v-for="msg in sortedMessages" 
          :key="msg.id" 
          class="flex gap-4 items-end"
          :class="{ 'flex-row-reverse': isSelf(msg) }"
        >
          <!-- Message Bubble -->
          <div 
            class="max-w-[70%] px-6 py-3 border-3 border-black font-bold text-sm md:text-base break-words whitespace-pre-wrap shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            :class="isSelf(msg) ? 'bg-indie-primary text-black rounded-3xl rounded-br-none' : 'bg-white text-black rounded-3xl rounded-bl-none'"
          >
            {{ msg.content }}
          </div>
        </div>
      </template>
    </div>

    <!-- Input Area -->
    <div class="bg-white border-t-3 border-black p-6">
      <div class="flex gap-4 max-w-4xl mx-auto items-center">
        <input 
          v-model="inputContent"
          type="text" 
          placeholder="TYPE YOUR MESSAGE..." 
          class="flex-1 px-6 py-4 border-3 border-black bg-gray-50 font-bold focus:outline-none focus:shadow-brutal-hover transition-all uppercase placeholder-gray-400"
          @keydown.enter="handleSend"
        >
        <button 
          @click="handleSend"
          :disabled="!inputContent.trim() || sending"
          class="px-8 py-4 bg-indie-secondary border-3 border-black shadow-brutal hover:shadow-brutal-hover hover:-translate-y-1 active:shadow-brutal-active active:translate-y-1 transition-all font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ sending ? 'SENDING' : 'SEND' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMessages } from '~/composables/useMessages'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const route = useRoute()
const conversationId = route.params.id as string
const user = useSupabaseUser()
const client = useSupabaseClient()
const { fetchUnreadCount } = useMessages()

const inputContent = ref('')
const sending = ref(false)
const messageContainer = ref<HTMLElement | null>(null)

interface Message {
  id: string
  content: string
  created_at: string
  from_user_id: string
  to_user_id: string
  is_read: boolean
}

interface ChatResponse {
  data: Message[]
  conversation: {
    id: string
    otherUser: {
      id: string
      username: string
      avatar_url: string
    }
  }
}

// Fetch initial data
const { data: result, pending, refresh } = await useFetch<ChatResponse>(`/api/messages/${conversationId}`)

const messages = ref(result.value?.data || [])
const otherUser = computed(() => result.value?.conversation?.otherUser)

const sortedMessages = computed(() => {
  return [...messages.value].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
})

const isSelf = (msg: any) => msg.from_user_id === user.value?.id

const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

// Mark as read
const markAsRead = async () => {
  try {
    await $fetch('/api/messages/read', {
      method: 'POST',
      body: { conversationId }
    })
    fetchUnreadCount() // Update global badge
  } catch (e) {
    console.error('Failed to mark read', e)
  }
}

// Send Message
const handleSend = async () => {
  const content = inputContent.value.trim()
  if (!content || sending.value) return

  sending.value = true
  try {
    const response = await $fetch<{ data: Message }>('/api/messages/send', {
      method: 'POST',
      body: {
        toUserId: otherUser.value?.id,
        content
      }
    })
    const newMsg = response.data

    
    // Optimistic update or wait for realtime?
    // Let's add it immediately to avoid lag feeling
    if (newMsg) {
      messages.value.unshift(newMsg) // raw messages are order desc (newest first). Wait, my sortedMessages handles sort.
      // But my `messages` ref is initialized from API which returned DESC (newest first).
      // So unshift adds to the start (newest). Correct.
      inputContent.value = ''
      scrollToBottom()
    }
  } catch (e) {
    alert('发送失败')
  } finally {
    sending.value = false
  }
}

// Realtime Subscription
let channel: any

onMounted(() => {
  scrollToBottom()
  markAsRead()

  channel = client.channel(`conversation:${conversationId}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages', 
      filter: `conversation_id=eq.${conversationId}` 
    }, (payload) => {
      const newMsg = payload.new as unknown as Message
      // Avoid duplicate if sent by me (optimistic update might conflict if we don't handle it)
      // But since I used $fetch to send, I got the ID back.
      // If I receive my OWN message via realtime, I should check if it exists.
      if (!messages.value.find((m: any) => m.id === newMsg.id)) {
        messages.value.unshift(newMsg)
        scrollToBottom()
        if (newMsg.to_user_id === user.value?.id) {
          markAsRead()
        }
      }
    })
    .subscribe()
})

onUnmounted(() => {
  if (channel) client.removeChannel(channel)
})
</script>

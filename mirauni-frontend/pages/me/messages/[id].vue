<template>
  <div class="h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-indie-border px-4 py-3 flex items-center gap-3 shadow-sm z-10">
      <NuxtLink to="/me/messages" class="md:hidden text-2xl mr-2">←</NuxtLink>
      <template v-if="otherUser">
        <img 
          :src="otherUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + otherUser.username" 
          :alt="otherUser.username"
          class="w-10 h-10 rounded-full border border-indie-border bg-gray-100"
        >
        <div>
          <h2 class="font-bold">{{ otherUser.username }}</h2>
          <span class="text-xs text-green-500 flex items-center gap-1">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            在线 (Mock)
          </span>
        </div>
      </template>
    </div>

    <!-- Messages Area -->
    <div ref="messageContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-if="pending" class="flex justify-center py-8">
        <div class="animate-spin text-2xl">🎲</div>
      </div>

      <template v-else>
        <div 
          v-for="msg in sortedMessages" 
          :key="msg.id" 
          class="flex gap-2"
          :class="{ 'flex-row-reverse': isSelf(msg) }"
        >
          <div 
            class="max-w-[70%] px-4 py-2 rounded-xl text-sm break-words whitespace-pre-wrap shadow-sm"
            :class="isSelf(msg) ? 'bg-indie-primary text-white rounded-tr-none' : 'bg-white border border-indie-border rounded-tl-none'"
          >
            {{ msg.content }}
          </div>
        </div>
      </template>
    </div>

    <!-- Input Area -->
    <div class="bg-white border-t border-indie-border p-4">
      <div class="flex gap-2 max-w-4xl mx-auto">
        <input 
          v-model="inputContent"
          type="text" 
          placeholder="输入消息..." 
          class="flex-1 px-4 py-2 border-2 border-indie-border rounded-lg focus:outline-none focus:border-indie-accent bg-gray-50"
          @keydown.enter="handleSend"
        >
        <button 
          @click="handleSend"
          :disabled="!inputContent.trim() || sending"
          class="px-6 py-2 bg-indie-secondary border-2 border-indie-border shadow-brutal active:shadow-none translate-y-0 active:translate-y-1 transition-all rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ sending ? '...' : '发送' }}
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

// Fetch initial data
const { data: result, pending, refresh } = await useFetch(`/api/messages/${conversationId}`)

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
    const { data: newMsg } = await $fetch('/api/messages/send', {
      method: 'POST',
      body: {
        toUserId: otherUser.value.id,
        content
      }
    })
    
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
      const newMsg = payload.new
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

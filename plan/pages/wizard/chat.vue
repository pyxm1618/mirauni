<template>
  <div class="h-[600px] flex flex-col bg-gray-50 border-3 border-black shadow-hard rounded-2xl overflow-hidden relative">
    
    <!-- Chat Area -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" ref="chatContainer">
      <!-- Welcome Message -->
      <ChatBubble role="ai">
        你好！我是你的 AI 搞钱助手。
        <br/><br/>
        我看到你想做 <b>{{ store.openQuestion }}</b>，目标是年入 <b>{{ store.incomeGoal }}万</b>。
        <br/>
        为了帮你规划得更靠谱，我需要再多问一两句，可以吗？
      </ChatBubble>

      <!-- History -->
      <ChatBubble 
        v-for="(msg, idx) in store.conversationHistory" 
        :key="idx" 
        :role="msg.role"
      >
        {{ msg.content }}
      </ChatBubble>
      
      <!-- Loading Indicator -->
      <div v-if="loading" class="flex justify-start">
        <div class="bg-gray-200 text-gray-500 rounded-2xl rounded-tl-none p-4 text-sm animate-pulse">
          正在思考...
        </div>
      </div>
      
      <!-- Spacer for auto-scroll -->
      <div ref="bottomAnchor"></div>
    </div>

    <!-- Input Area -->
    <div class="p-4 bg-white border-t-3 border-black">
      <div class="flex gap-2">
        <input
          v-model="input"
          @keydown.enter="send"
          type="text"
          :disabled="loading"
          class="flex-1 border-3 border-gray-300 focus:border-black rounded-lg px-4 py-3 outline-none transition-colors"
          placeholder="输入你的回答..."
          autofocus
        />
        <UButton
          @click="send"
          :loading="loading"
          :disabled="!input.trim()"
          size="lg"
          color="black"
          icon="i-lucide-send-horizontal"
        />
      </div>
       <div class="mt-2 text-center">
         <button @click="skip" class="text-xs text-gray-400 underline hover:text-black">
           跳过对话，直接生成计划
         </button>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatBubble from '~/components/wizard/ChatBubble.vue'
import { useWizardStore } from '~/stores/wizard'

definePageMeta({
    layout: 'blank'
})

const store = useWizardStore()
const router = useRouter()
const input = ref('')
const loading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const bottomAnchor = ref<HTMLElement | null>(null)

// Auto scroll
watch(() => store.conversationHistory.length, () => {
  nextTick(() => {
    bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' })
  })
})

async function send() {
  if (!input.value.trim() || loading.value) return
  
  const userMsg = input.value.trim()
  store.addMessage('user', userMsg)
  input.value = ''
  
  loading.value = true
  
  try {
    const response = await $fetch('/api/wizard/ai/interview', {
      method: 'POST',
      body: {
        history: store.conversationHistory,
        context: {
            incomeGoal: store.incomeGoal,
            profile: store.profile,
            openQuestion: store.openQuestion
        }
      }
    })
    
    if (response.success && response.reply) {
        if (response.reply.includes('CONFIRM_END')) {
             // End of conversation
             store.addMessage('ai', "好的，我已经完全理解了。正在为你生成专属计划...")
             setTimeout(() => {
                 finish()
             }, 1500)
        } else {
             store.addMessage('ai', response.reply)
        }
    }
  } catch (e) {
    store.addMessage('ai', "（网络有点小问题，不过没事，我们继续）")
  } finally {
    loading.value = false
  }
}

function skip() {
    finish()
}

function finish() {
    // Proceed to Plan Generation
    router.push('/wizard/plan')
}

onMounted(() => {
    store.currentStep = 4 // Update stepper
})
</script>

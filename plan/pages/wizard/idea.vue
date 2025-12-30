<template>
  <div class="space-y-8">
    <div class="text-center mb-4">
      <h2 class="text-2xl md:text-3xl font-black">一句话告诉我</h2>
      <p class="text-gray-500 font-medium mt-2">
        你今年最想做成什么事？或者有什么模糊的赚钱想法？
      </p>
    </div>

    <div class="space-y-4">
      <div class="relative">
        <textarea
          v-model="answer"
          rows="6"
          class="w-full border-3 border-black text-black bg-toon-50 rounded-xl p-4 text-lg focus:outline-none focus:shadow-hard transition-all resize-none placeholder-gray-400"
          placeholder="比如：我想做一个服务开发者的工具，或者写一个技术专栏..."
        ></textarea>
        <!-- Idea Chips (Quick Fill) -->
        <div class="absolute bottom-4 right-4 flex gap-2">
            <UButton 
                size="xs" color="white"
                label="还没想法" 
                @click="answer = '我还没具体想法，想看看有什么适合我的'"
            />
        </div>
      </div>
      
      <p class="text-sm text-gray-500 text-center">
        AI 会根据你的回答来判断是否需要追问细节
      </p>
    </div>

    <div class="flex justify-between pt-8">
       <UButton
        @click="back"
        variant="ghost"
        color="gray"
        class="px-8"
      >
        上一步
      </UButton>
      <UButton
        @click="next"
        size="xl"
        class="px-12 font-bold"
        color="black"
      >
        让 AI 分析
        <UIcon name="i-lucide-sparkles" />
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'

const store = useWizardStore()
const router = useRouter()

const answer = ref(store.openQuestion)

function next() {
  store.setOpenQuestion(answer.value || '无') // Default to '无' if empty
  store.currentStep = 4
  // Navigate to AI Chat page
  router.push('/wizard/chat')
}

function back() {
    store.currentStep = 2
    router.push('/wizard/profile')
}

onMounted(() => {
    store.currentStep = 3
})
</script>

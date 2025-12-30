<template>
  <div class="flex flex-col items-center justify-center space-y-12 py-8">
    <div class="text-center space-y-4">
      <h2 class="text-3xl md:text-4xl font-black">2025年目标收入是什么？</h2>
      <p class="text-gray-500 font-medium text-lg">大胆填，AI 帮你拆解怎么赚到这么多钱</p>
    </div>

    <div class="relative w-full max-w-sm">
      <input
        v-model="incomeGoal"
        type="number"
        class="w-full text-center text-6xl font-black border-b-4 border-black bg-transparent focus:outline-none focus:border-toon-500 placeholder-gray-200 py-4 font-mono transition-colors"
        placeholder="100"
        autofocus
      />
      <span class="absolute right-0 bottom-6 text-2xl font-bold text-gray-400">万元/年</span>
    </div>

    <UButton
      @click="next"
      :disabled="!isValid"
      size="xl"
      class="px-16 py-3 text-xl font-bold"
      color="black"
    >
      下一步
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'

const store = useWizardStore()
const router = useRouter()

const incomeGoal = ref(store.incomeGoal || '')

const isValid = computed(() => {
  const goal = Number(incomeGoal.value)
  return goal > 0 && goal < 100000 // Reasonable limits
})

function next() {
  if (!isValid.value) return
  
  store.setIncomeGoal(Number(incomeGoal.value))
  store.currentStep = 2 // Manually sync step for stepper
  router.push('/wizard/profile')
}

// On mount reset step if accessed directly
onMounted(() => {
    store.currentStep = 1
})
</script>

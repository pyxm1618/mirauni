<template>
  <div class="w-full max-w-3xl mx-auto mb-8">
    <div class="flex items-center justify-between relative">
      <!-- Progress Bar Background -->
      <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
      
      <!-- Progress Bar Active -->
      <div 
        class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-black transition-all duration-300 -z-10"
        :style="{ width: progressPercentage + '%' }"
      ></div>

      <!-- Steps -->
      <div 
        v-for="step in totalSteps" 
        :key="step"
        class="flex flex-col items-center gap-2"
      >
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-3 transition-colors duration-300 bg-white"
          :class="[
            currentStep >= step ? 'border-black' : 'border-gray-300 text-gray-300',
            currentStep === step ? 'bg-toon-400 text-white' : '',
            currentStep > step ? 'bg-black text-white' : ''
          ]"
        >
          <UIcon v-if="currentStep > step" name="i-lucide-check" class="w-5 h-5" />
          <span v-else>{{ step }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentStep: number
  totalSteps?: number
}>()

const totalSteps = props.totalSteps || 4
const progressPercentage = computed(() => {
  return ((props.currentStep - 1) / (totalSteps - 1)) * 100
})
</script>

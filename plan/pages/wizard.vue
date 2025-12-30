<template>
  <div class="max-w-4xl mx-auto py-8">
    <WizardStepper :current-step="currentStep" :total-steps="4" />
    
    <div class="bg-white border-3 border-black shadow-hard rounded-2xl p-8 md:p-12 min-h-[400px]">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'

definePageMeta({
  layout: 'default'
})

const store = useWizardStore()
const currentStep = computed(() => store.currentStep)
</script>

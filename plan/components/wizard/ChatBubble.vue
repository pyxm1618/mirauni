<template>
  <div 
    class="flex w-full"
    :class="isUser ? 'justify-end' : 'justify-start'"
  >
    <div 
      class="max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-base md:text-lg border-3 border-black shadow-hard"
      :class="[
        isUser 
          ? 'bg-black text-white rounded-tr-none' 
          : 'bg-white text-black rounded-tl-none'
      ]"
    >
      <!-- Avatar/Name Label (Optional) -->
      <div v-if="!isUser" class="mb-1 text-xs font-bold text-toon-500 uppercase tracking-wider flex items-center gap-1">
        <UIcon name="i-lucide-sparkles" class="w-3 h-3" />
        AI Guide
      </div>

      <div class="whitespace-pre-wrap leading-relaxed">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  role: 'user' | 'ai'
}>()

const isUser = computed(() => props.role === 'user')
</script>

<template>
  <div class="relative w-full">
    <input 
      :value="modelValue"
      @input="handleInput"
      :type="showPassword ? 'text' : 'password'" 
      :placeholder="placeholder"
      class="w-full bg-gray-50 px-4 py-4 pr-12 border-2 border-indie-border font-bold text-lg focus:outline-none focus:shadow-brutal focus:bg-indie-secondary/20 transition-all placeholder-gray-400"
      v-bind="$attrs"
    />
    <button 
      type="button"
      @click="toggleShow"
      class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black focus:outline-none flex items-center justify-center p-1 border-2 border-transparent hover:border-black hover:bg-gray-100 transition-all"
      :title="showPassword ? $t('auth.passwordInput.hide') : $t('auth.passwordInput.show')"
      :aria-label="showPassword ? $t('auth.passwordInput.hide') : $t('auth.passwordInput.show')"
    >
      <!-- 使用 SVG 适配以防万一组件库 Icon 未能加载，也保证完美的 Brutalist 手工质感 -->
      <svg v-if="showPassword" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L8.62 8.62m1.26 1.26L14.65 14.65M17.65 17.65L19 19M4 4l16 16"></path>
      </svg>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)

function toggleShow() {
  showPassword.value = !showPassword.value
}

function handleInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

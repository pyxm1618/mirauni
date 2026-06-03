<template>
  <UModal :model-value="modelValue" @update:model-value="handleUpdate">
    <div class="p-8 bg-white border-3 border-black shadow-brutal text-center">
      <h3 class="text-2xl font-black mb-6 uppercase">{{ $t('me.profile.logoutConfirm') || '确定要退出登录吗？' }}</h3>
      <div class="flex gap-4 justify-center">
        <button 
          type="button"
          :disabled="isConfirming"
          @click="handleCancel" 
          class="px-6 py-3 border-3 border-black font-bold uppercase hover:bg-gray-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ $t('common.cancel') || '取消' }}
        </button>
        <button 
          type="button"
          :disabled="isConfirming"
          @click="handleConfirm" 
          class="px-6 py-3 bg-red-500 text-white border-3 border-black font-black uppercase hover:bg-red-600 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="isConfirming" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ $t('common.confirm') || '确定' }}
        </button>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const isConfirming = ref(false)

watch(() => props.modelValue, (val) => {
  if (!val) {
    isConfirming.value = false
  }
})

function handleUpdate(val: boolean) {
  if (!isConfirming.value) {
    emit('update:modelValue', val)
  }
}

function handleCancel() {
  if (!isConfirming.value) {
    emit('update:modelValue', false)
  }
}

function handleConfirm() {
  if (isConfirming.value) return
  isConfirming.value = true
  emit('confirm')
}
</script>

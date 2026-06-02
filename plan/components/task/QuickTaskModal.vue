<template>
  <UModal v-model="isOpen">
    <div class="p-6 bg-white border-3 border-black shadow-hard rounded-xl">
      <div class="flex justify-between items-start mb-6">
        <h3 class="text-xl font-black">⚡️ 快速创建任务</h3>
        <UButton 
            color="gray" variant="ghost" icon="i-lucide-x" size="sm" 
            @click="isOpen = false"
        />
      </div>

      <form @submit.prevent="create" class="space-y-4">
        <div>
            <label class="text-xs font-bold text-gray-500 uppercase">任务名称</label>
            <input 
                v-model="taskName"
                placeholder="例：完成项目文档"
                class="w-full text-lg font-bold border-b-2 border-gray-200 focus:border-black outline-none py-2"
                autofocus
            />
        </div>

        <div class="pt-4">
            <UButton 
                type="submit" 
                block 
                color="black" 
                :loading="loading"
                :disabled="!taskName.trim()"
            >
                创建任务
            </UButton>
        </div>
      </form>
    </div>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'created'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const taskName = ref('')
const loading = ref(false)

async function create() {
    if (!taskName.value.trim()) return
    
    loading.value = true
    try {
        await $fetch('/api/tasks', {
            method: 'POST',
            body: { name: taskName.value.trim() }
        })
        emit('created')
        taskName.value = ''
        isOpen.value = false
    } catch (e) {
        console.error('Failed to create task', e)
        alert('创建失败，请重试')
    } finally {
        loading.value = false
    }
}

// Reset form when modal opens
watch(isOpen, (val) => {
    if (val) taskName.value = ''
})
</script>

<template>
  <UModal v-model="isOpen">
    <div class="p-6 bg-white border-3 border-black shadow-hard rounded-xl">
      <div class="flex justify-between items-start mb-6">
        <h3 class="text-xl font-black">任务详情</h3>
        <UButton 
            color="gray" variant="ghost" icon="i-lucide-x" size="sm" 
            @click="isOpen = false"
        />
      </div>

      <div class="space-y-4" v-if="localTask">
        <!-- Title Edit -->
        <div>
            <label class="text-xs font-bold text-gray-500 uppercase">任务名称</label>
            <input 
                v-model="localTask.name"
                class="w-full text-lg font-bold border-b-2 border-gray-200 focus:border-black outline-none py-1"
            />
        </div>

        <!-- Status -->
        <div class="flex items-center gap-2">
             <label class="text-xs font-bold text-gray-500 uppercase">状态：</label>
             <UBadge :color="localTask.status === 'done' ? 'green' : 'gray'" variant="solid">
                 {{ localTask.status === 'done' ? '已完成' : '待办' }}
             </UBadge>
        </div>
        
        <!-- Actions -->
        <div class="pt-6 flex flex-col gap-2">
             <div class="flex gap-2">
                <UButton block color="black" class="flex-1" @click="save">保存修改</UButton>
                <UButton 
                    v-if="localTask.status !== 'done'"
                    block color="green" variant="soft" class="flex-1"
                    @click="complete"
                >
                    标记完成
                </UButton>
             </div>
             <UButton 
                variant="ghost" color="red" size="xs" block
                @click="remove"
            >
                删除任务
            </UButton>
        </div>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  task: any
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'update', 'complete', 'delete'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const localTask = ref({ ...props.task })

watch(() => props.task, (newVal) => {
    localTask.value = { ...newVal }
})

function save() {
    emit('update', localTask.value)
    isOpen.value = false
}

function complete() {
    emit('complete', localTask.value)
    isOpen.value = false
}

function remove() {
    if(!confirm('确定要删除这个任务吗？')) return
    emit('delete', localTask.value)
    isOpen.value = false
}
</script>

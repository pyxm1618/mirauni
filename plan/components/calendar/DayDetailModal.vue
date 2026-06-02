<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-lg' }">
    <div class="p-6 bg-white border-3 border-black shadow-hard rounded-xl">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-black">
          📅 {{ formattedDate }}
        </h3>
        <UButton color="gray" variant="ghost" icon="i-lucide-x" size="sm" @click="isOpen = false" />
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-4">
        <UButton 
            :color="activeTab === 'tasks' ? 'black' : 'white'" 
            size="sm"
            @click="activeTab = 'tasks'"
        >
            📋 任务 ({{ dayData?.tasks?.length || 0 }})
        </UButton>
        <UButton 
            :color="activeTab === 'income' ? 'black' : 'white'" 
            size="sm"
            @click="activeTab = 'income'"
        >
            💰 收入 ({{ dayData?.income?.length || 0 }})
        </UButton>
      </div>

      <!-- Tasks Tab -->
      <div v-if="activeTab === 'tasks'" class="space-y-2 max-h-64 overflow-y-auto">
        <div v-if="dayData?.tasks?.length === 0" class="text-center py-8 text-gray-400">
            无任务
        </div>
        <div 
            v-for="task in dayData?.tasks" 
            :key="task.id"
            class="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black/10 rounded-lg hover:border-black transition-colors"
        >
            <input 
                type="checkbox" 
                :checked="task.status === 'done'"
                class="w-5 h-5 rounded border-2 border-black accent-black"
                @change="toggleTask(task)"
            />
            <div class="flex-1">
                <div :class="{'line-through text-gray-400': task.status === 'done'}" class="font-bold">
                    {{ task.name }}
                </div>
                <div v-if="task.project_name" class="text-xs text-gray-500">
                    📁 {{ task.project_name }}
                </div>
            </div>
        </div>
      </div>

      <!-- Income Tab -->
      <div v-if="activeTab === 'income'" class="space-y-2 max-h-64 overflow-y-auto">
        <div v-if="dayData?.income?.length === 0" class="text-center py-8 text-gray-400">
            无收入记录
        </div>
        <div 
            v-for="inc in dayData?.income" 
            :key="inc.id"
            class="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg"
        >
            <div class="font-bold text-green-700">¥{{ inc.amount }}</div>
            <div class="text-sm text-gray-500">{{ inc.note || '无备注' }}</div>
        </div>
        <div v-if="dayData?.income?.length" class="pt-2 border-t border-black/10 text-right font-black">
            合计: ¥{{ totalIncome }}
        </div>
      </div>

      <!-- Check-in Status -->
      <div class="mt-4 pt-4 border-t border-black/10 flex items-center gap-2">
        <span v-if="dayData?.checkedIn" class="text-green-600 font-bold">
            ✅ 已打卡
        </span>
        <span v-else class="text-gray-400">
            ⬜ 未打卡
        </span>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  dayData: {
    date: string
    tasks: any[]
    income: any[]
    checkedIn: boolean
  } | null
}>()

const emit = defineEmits(['update:modelValue', 'refresh'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeTab = ref<'tasks' | 'income'>('tasks')

const formattedDate = computed(() => {
    if (!props.dayData) return ''
    const d = new Date(props.dayData.date)
    return `${d.getMonth() + 1}月${d.getDate()}日`
})

const totalIncome = computed(() => {
    return props.dayData?.income?.reduce((sum, i) => sum + Number(i.amount), 0) || 0
})

async function toggleTask(task: any) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    try {
        await $fetch(`/api/tasks/${task.id}`, {
            method: 'PATCH',
            body: { status: newStatus }
        })
        task.status = newStatus
        emit('refresh')
    } catch (e) {
        useToast().add({ title: '更新失败', color: 'red' })
    }
}
</script>

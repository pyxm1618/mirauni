<template>
  <UModal v-model="isOpen" :ui="{ width: 'w-full sm:max-w-3xl' }">
    <div class="bg-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      <!-- Header -->
      <div class="bg-black text-white p-6 flex justify-between items-start">
        <div>
           <div class="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">里程碑 (Milestone)</div>
           <h2 class="text-2xl font-black leading-tight">{{ project.name }}</h2>
           <div class="mt-2 flex gap-2">
              <UBadge color="white" variant="solid" size="sm" class="text-black font-bold">
                 {{ project.status === 'in_progress' ? '进行中' : '待开始' }}
              </UBadge>
              <span class="text-xs text-gray-400 flex items-center bg-gray-800 px-2 rounded">
                 📅 {{ formatDate(project.start_date) }} - {{ formatDate(project.end_date) }}
              </span>
           </div>
        </div>
        <UButton color="white" variant="ghost" icon="i-lucide-x" @click="isOpen = false" />
      </div>

      <!-- Stats Bar -->
      <div class="bg-gray-50 border-b border-gray-200 p-4 flex gap-8">
         <div>
            <div class="text-xs font-bold text-gray-400 uppercase">进度</div>
            <div class="font-black text-xl">{{ progress }}%</div>
         </div>
         <div>
            <div class="text-xs font-bold text-gray-400 uppercase">任务</div>
            <div class="font-black text-xl">{{ completedCount }} / {{ totalCount }}</div>
         </div>
         <div class="flex-1"></div>
         <UButton size="sm" color="black" icon="i-lucide-plus" @click="showAddTask = true">添加任务</UButton>
      </div>

      <!-- Task List (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100">
         
         <!-- Add Task Input -->
         <div v-if="showAddTask" class="bg-white p-3 rounded-xl shadow-sm border-2 border-black mb-4 animate-in fade-in slide-in-from-top-2">
            <input 
              v-model="newTaskName" 
              placeholder="输入任务名称，按回车添加..." 
              class="w-full font-bold outline-none mb-2"
              @keyup.enter="addTask"
              autofocus
            />
            <div class="flex justify-between items-center">
               <div class="flex gap-2">
                  <span class="text-xs bg-gray-100 px-2 py-1 rounded font-bold text-gray-500">默认 2小时</span>
               </div>
               <div class="flex gap-2">
                  <UButton size="xs" color="gray" variant="ghost" @click="showAddTask = false">取消</UButton>
                  <UButton size="xs" color="black" @click="addTask" :disabled="!newTaskName">确定</UButton>
               </div>
            </div>
         </div>

         <div v-if="localTasks.length === 0" class="text-center py-8 text-gray-400">
            暂无任务，点击上方按钮添加
         </div>

         <div 
            v-for="task in localTasks" 
            :key="task.id"
            class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3 group hover:border-black transition-colors"
         >
            <UCheckbox 
                v-model="task.isDone" 
                @change="toggleTask(task)" 
                class="mt-1"
            />
            <div class="flex-1">
                <div class="font-bold text-sm" :class="task.isDone ? 'line-through text-gray-400' : 'text-gray-800'">
                    {{ task.name }}
                </div>
                <div class="flex gap-2 mt-1">
                    <span class="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{{ task.planned_date || '未排期' }}</span>
                    <span class="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{{ task.original_estimate }}h</span>
                </div>
            </div>
            <UButton 
                color="red" 
                variant="ghost" 
                icon="i-lucide-trash-2" 
                size="xs" 
                class="opacity-0 group-hover:opacity-100 transition-opacity"
                @click="deleteTask(task)"
            />
         </div>
      </div>

    </div>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  project: any
}>()

const emit = defineEmits(['update:modelValue', 'refresh'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Local state copy for optimistic UI
const localTasks = ref<any[]>([])
const showAddTask = ref(false)
const newTaskName = ref('')

// Computed Stats
const totalCount = computed(() => localTasks.value.length)
const completedCount = computed(() => localTasks.value.filter(t => t.isDone).length)
const progress = computed(() => totalCount.value === 0 ? 0 : Math.round((completedCount.value / totalCount.value) * 100))

// Init
watch(() => props.project, (newP) => {
    if (newP && newP.tasks) {
        localTasks.value = newP.tasks.map((t: any) => ({
            ...t,
            isDone: t.status === 'done'
        }))
    }
}, { immediate: true })

function formatDate(str: string) {
    if (!str) return '待定'
    return new Date(str).toLocaleDateString('zh-CN')
}

// Actions
const client = useSupabaseClient()

async function toggleTask(task: any) {
    const newStatus = task.isDone ? 'done' : 'todo'
    try {
        await client.from('tasks').update({ status: newStatus }).eq('id', task.id)
        emit('refresh') // Notify parent to reload data in background
    } catch (e) {
        console.error(e)
        task.isDone = !task.isDone // Revert on error
    }
}

async function addTask() {
    if (!newTaskName.value) return
    const name = newTaskName.value
    const projectId = props.project.id
    const user = useSupabaseUser()
    
    // Optimistic add
    const tempId = 'temp-' + Date.now()
    localTasks.value.unshift({
        id: tempId,
        name: name,
        status: 'todo',
        isDone: false,
        original_estimate: 2,
        planned_date: new Date().toISOString().split('T')[0] // Default to today
    })
    
    showAddTask.value = false
    newTaskName.value = ''

    try {
        const { data, error } = await client.from('tasks').insert({
            project_id: projectId,
            user_id: user.value?.id,
            name: name,
            status: 'todo',
            original_estimate: 2,
            task_type: 'core',
            planned_date: new Date().toISOString().split('T')[0]
        }).select().single()
        
        if (data) {
            // Replace temp with real
            const idx = localTasks.value.findIndex(t => t.id === tempId)
            if (idx !== -1) localTasks.value[idx] = { ...data, isDone: false }
            emit('refresh')
        }
    } catch (e) {
        console.error(e)
    }
}

async function deleteTask(task: any) {
    if (!confirm('确定删除此任务？')) return
    
    // Optimistic delete
    localTasks.value = localTasks.value.filter(t => t.id !== task.id)
    
    try {
        await client.from('tasks').delete().eq('id', task.id)
        emit('refresh')
    } catch (e) {
        console.error(e)
    }
}
</script>

<template>
  <div class="space-y-8 pb-20">
    <div class="text-center space-y-4">
      <h2 class="text-3xl font-black">第一阶段执行计划 (M1)</h2>
      <p class="text-gray-500 font-medium">这是实现目标的第一个关键战役。我们已验证可行性。</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-20 text-center space-y-4">
      <div class="animate-spin text-4xl">⚙️</div>
      <p class="text-lg font-bold text-gray-600">正在拆解首月任务细节...</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Feasibility Alert -->
      <div v-if="hasOverload" class="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-xl">
        <div class="flex items-center gap-2 text-orange-800 font-bold mb-1">
          <UIcon name="i-lucide-scale" />
          <span>工时负载分析</span>
        </div>
        <p class="text-sm text-orange-700">
          AI 估算的任务总量略多于你分配的每日时间。
          <span class="font-bold">这不是错误，</span>这意味着你可以：
          1. 删除一些标为“辅助”的任务；
          2. 保持现状（这意味着实际完成时间可能会比计划晚几天）。
        </p>
      </div>

      <!-- Path Detail Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-for="(path, pIdx) in pathsWithTasks" :key="pIdx" class="bg-white border-3 border-black rounded-2xl overflow-hidden flex flex-col">
           <!-- Header -->
           <div class="bg-gray-50 p-4 border-b-2 border-gray-100">
             <div class="flex justify-between items-center mb-2">
                <span class="font-black text-lg">{{ path.name }}</span>
                <span class="bg-black text-white text-xs px-2 py-1 rounded-full font-bold">M1: {{ path.m1.name }}</span>
             </div>
             
             <!-- Budget Bar -->
             <div class="flex items-center gap-2 text-xs font-bold">
               <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                 <div 
                    class="h-full transition-all duration-500" 
                    :class="path.utilization > 100 ? 'bg-red-500' : 'bg-green-500'"
                    :style="{ width: `${Math.min(path.utilization, 100)}%` }"
                 ></div>
               </div>
               <span :class="path.utilization > 100 ? 'text-red-500' : 'text-gray-400'">
                 {{ path.totalHours }}h / {{ path.budgetHours }}h
               </span>
             </div>
           </div>

           <!-- Task List -->
           <div class="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
             <div 
                v-for="(task, tIdx) in path.tasks" 
                :key="tIdx"
                class="flex items-start gap-3 group p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
             >
               <div class="mt-1">
                 <UIcon 
                    :name="task.type === 'core' ? 'i-lucide-star' : 'i-lucide-circle'" 
                    class="w-4 h-4"
                    :class="task.type === 'core' ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'"
                 />
               </div>
                <div class="flex-1">
                 <!-- Editable Task Name -->
                 <input 
                    v-model="task.name"
                    class="w-full font-bold text-sm leading-tight bg-transparent border-b border-transparent focus:border-gray-300 outline-none transition-colors"
                 />
                 <div class="text-xs text-gray-400 flex items-center gap-2 mt-1">
                    <!-- Editable Hours -->
                    <div class="flex items-center gap-1">
                        <input 
                            type="number" 
                            v-model.number="task.hours"
                            @change="recalcPath(pIdx)"
                            min="0.5"
                            step="0.5"
                            class="w-8 text-center bg-gray-50 rounded border-none focus:ring-1 focus:ring-black outline-none no-spinner font-mono"
                        />
                        <span>h</span>
                    </div>
                    
                    <!-- Toggle Type Core/Support -->
                    <button 
                        @click="toggleTaskType(task)"
                        class="px-1 rounded text-xs transition-colors"
                        :class="task.type === 'support' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-50 text-yellow-700'"
                    >
                        {{ task.type === 'support' ? '辅助' : '核心' }}
                    </button>
                 </div>
               </div>
               <!-- Delete Action -->
               <button @click="removeTask(pIdx, Number(tIdx))" class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500">
                 <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
               </button>
             </div>
           </div>

           <!-- Add Task Button -->
           <button @click="addTask(pIdx)" class="p-3 border-t border-gray-100 text-center text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-black transition-colors">
             + 添加任务
           </button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center pt-8 border-t-2 border-gray-100 bg-white sticky bottom-0 z-20 pb-4">
       <UButton @click="router.back()" variant="ghost" color="gray">上一步</UButton>
       
       <div class="flex items-center gap-4">
           <div class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
               <label class="text-xs font-bold text-gray-500 uppercase">开始执行日期</label>
               <input 
                  type="date" 
                  v-model="startDate"
                  :min="todayStr"
                  class="bg-transparent font-bold outline-none text-sm"
               />
           </div>

           <UButton 
              @click="saveAndStart" 
              size="xl" 
              color="black" 
              class="px-12 font-bold"
              :loading="saving"
              :disabled="loading"
           >
              启动计划
            </UButton>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'

definePageMeta({
    layout: 'blank'
})

const store = useWizardStore()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const saving = ref(false)
const pathsWithTasks = ref<any[]>([])
const todayStr = new Date().toISOString().split('T')[0]
// Default start date: Tomorrow (to give user prep time) or Today if they want
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
const startDate = ref(tomorrow.toISOString().split('T')[0])

const hasOverload = computed(() => pathsWithTasks.value.some(p => p.utilization > 100))

onMounted(async () => {
  if (!store.generatedPlan || !store.generatedPlan.milestones) {
    // Should not happen if flow is followed
    router.replace('/wizard/timeline')
    return
  }
// ... (rest of the file)

  // Generate Tasks for M1 of each path
  try {
    const promises = store.paths.map(async (path, index) => {
        // Find M1
        const genPath = store.generatedPlan.milestones.find((gp: any) => gp.path_index === index) || store.generatedPlan.milestones[index]
        const m1 = genPath?.milestones[0]

        if (!m1) return null

        // Calculate Budget: Weeks * 5 Days * DailyHours * Weight%
        // dailyHours stored in path is user input
        const budgetHours = Math.round(m1.weeks * 5 * (path.dailyHours || 2))

        // API Call
        const res: any = await $fetch('/api/wizard/ai/tasks', {
            method: 'POST',
            body: {
                milestone: m1,
                path: { name: path.name, type: path.type },
                budgetHours
            }
        })

        return {
            ...path, // name, weight, etc.
            m1,      // reference to M1
            tasks: res.tasks || [],
            budgetHours,
            totalHours: (res.tasks || []).reduce((sum: number, t: any) => sum + t.hours, 0),
            utilization: 0 // calc later
        }
    })

    const results = await Promise.all(promises)
    pathsWithTasks.value = results.filter((p): p is NonNullable<typeof p> => Boolean(p)).map(p => {
        p.utilization = Math.round((p.totalHours / p.budgetHours) * 100)
        return p
    })

  } catch (e) {
    console.error(e)
    toast.add({ title: '生成失败', description: '无法生成任务详情', color: 'red' })
  } finally {
    loading.value = false
  }
})

function removeTask(pIdx: number, tIdx: number) {
    const p = pathsWithTasks.value[pIdx]
    const task = p.tasks[tIdx]
    p.tasks.splice(tIdx, 1)
    
    recalcPath(pIdx)
}

function addTask(pIdx: number) {
    const p = pathsWithTasks.value[pIdx]
    const newTask = { name: '新任务', hours: 2, type: 'core' }
    p.tasks.push(newTask)
    recalcPath(pIdx)
}

function recalcPath(pIdx: number) {
    const p = pathsWithTasks.value[pIdx]
    if (!p) return

    p.totalHours = p.tasks.reduce((sum: number, t: any) => sum + (Number(t.hours) || 0), 0)
    p.utilization = Math.round((p.totalHours / p.budgetHours) * 100)
}

function toggleTaskType(task: any) {
    task.type = task.type === 'core' ? 'support' : 'core'
}

async function saveAndStart() {
  saving.value = true
  try {
    // 1. Merge Tasks back into the Master Structure
    // We need to inject the 'tasks' array into the corresponding M1 in store.generatedPlan
    // So that the save API receives full tree.
    
    const finalGenerated = JSON.parse(JSON.stringify(store.generatedPlan))
    
    pathsWithTasks.value.forEach((p, idx) => {
        // Find corresponding path in generated
        // Assuming order matches index for simplicity, or we should have carried index
        // store.paths order matches pathsWithTasks order
        const gp = finalGenerated.milestones.find((g: any) => g.path_index === idx) || finalGenerated.milestones[idx]
        if (gp && gp.milestones[0]) {
            gp.milestones[0].tasks = p.tasks
        }
    })

    // 2. Call Save API
    const res: any = await $fetch('/api/wizard/save', {
        method: 'POST',
        body: {
            plan: {
                incomeGoal: store.incomeGoal,
                deadline: store.deadline,
                paths: store.paths,
                startDate: startDate.value // Pass user selection
            },
            generated: finalGenerated
        }
    })

    if (res.success) {
        toast.add({ title: '创建成功', description: '正在前往仪表盘...', color: 'green' })
        // Clear store?
        // store.$reset()
        router.push('/dashboard')
    }

  } catch (e: any) {
    toast.add({ title: '保存失败', description: e.message, color: 'red' })
  } finally {
    saving.value = false
  }
}
</script>
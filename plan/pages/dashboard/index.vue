<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <h1 class="text-3xl md:text-5xl font-black mb-1">早安，搞钱人!</h1>
        <p class="text-gray-500 font-medium">今天也是离 {{ stats.totalGoal }}万 更近的一天</p>
      </div>
      <div class="text-right hidden md:block">
        <div class="text-sm font-bold text-gray-400 uppercase">{{ targetYear }} 余额</div>
        <div class="text-4xl font-black font-mono">{{ daysLeftInYear }} <span class="text-lg">天</span></div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <StatCard 
        label="当前进度" 
        :value="stats.progress" 
        unit="%" 
        icon="i-lucide-activity"
        :has-progress="true"
        :progress="Number(stats.progress)"
      />
      <StatCard 
        label="累计收入" 
        :value="stats.currentIncome" 
        unit="万" 
        icon="i-lucide-wallet"
        subtext="继续加油！"
      />
      <StatCard 
        label="已完成任务" 
        :value="stats.completedTasks" 
        unit="个" 
        icon="i-lucide-check-square"
        icon-color="text-green-500"
        :subtext="`总计 ${stats.totalTasks} 个`"
      />
      <StatCard 
        label="活跃项目" 
        value="3" 
        unit="" 
        icon="i-lucide-folder-open"
        subtext="保持专注"
      />
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Today's Focus -->
        <div class="lg:col-span-2 space-y-4">
             <div class="flex justify-between items-center">
                <h2 class="text-2xl font-black flex items-center gap-2">
                    <UIcon name="i-lucide-zap" class="text-yellow-500" />
                    今日聚焦
                </h2>
                <UButton variant="link" color="gray" to="/dashboard/projects">查看全部</UButton>
            </div>
            
            <div v-if="loadingTasks" class="space-y-3">
                 <div v-for="i in 3" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse w-full"></div>
            </div>
            
            <div v-else-if="tasks.length > 0" class="space-y-3">
                 <TaskItem 
                    v-for="task in tasks" 
                    :key="task.id" 
                    :task="task" 
                    @toggle="toggleTask"
                    @click="openTask(task)"
                 />
            </div>
            
            <div v-else class="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-300">
                <p class="text-gray-400 font-bold">今天暂时没有任务，去项目里找点事做？</p>
                <UButton class="mt-4" to="/dashboard/projects">浏览项目</UButton>
            </div>
        </div>

        <!-- Right: Mini Calendar or AI Nudge -->
        <div class="space-y-6">
             <div class="bg-white p-4 border-3 border-black rounded-xl shadow-hard">
                 <h2 class="text-lg font-black mb-3">消息通知</h2>
                 <div v-if="notifications.length > 0" class="space-y-3">
                     <div v-for="(n, idx) in notifications" :key="idx" class="flex items-center gap-3 text-sm">
                         <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                             {{ n.type === 'like' ? '[+1]' : '[催]' }}
                         </div>
                         <div>
                             <span class="font-bold">{{ n.sender_nickname }}</span>
                             <span class="text-gray-500"> {{ n.type === 'like' ? '给你点了个赞' : '催你快去干活！' }}</span>
                         </div>
                     </div>
                 </div>
                 <div v-else class="text-center py-4 text-gray-400 text-sm">
                     暂无新消息
                 </div>
             </div>

             <div class="bg-black text-white p-6 rounded-xl border-3 border-gray-800 shadow-hard">
                <h3 class="font-black text-lg mb-2">AI 建议</h3>
                <p class="font-medium leading-relaxed mb-4">
                    "别忘了，哪怕只完成一个微小的任务，也是在向 {{ stats.totalGoal }}万 前进。"
                </p>
                <div class="text-xs text-gray-500 font-bold uppercase tracking-widest">FROM MONEY PATH AI</div>
            </div>
        </div>
    </div>

    <!-- Task Modal -->
    <TaskDetailModal 
        v-if="selectedTask"
        v-model="showModal"
        :task="selectedTask"
        @update="updateTask"
        @complete="completeTask"
        @delete="deleteTask"
    />
  </div>
</template>

<script setup lang="ts">
import StatCard from '~/components/dashboard/StatCard.vue'
import TaskItem from '~/components/task/TaskItem.vue'
import TaskDetailModal from '~/components/task/TaskDetailModal.vue'

definePageMeta({
    // Auth is handled globally by auth.global.ts
})

// 动态计算目标年份和余额天数
const now = new Date()
const targetYear = computed(() => {
  const month = now.getMonth() // 0-11
  const year = now.getFullYear()
  // 10月后开始规划下一年
  return month >= 9 ? year + 1 : year
})

const daysLeftInYear = computed(() => {
  const year = targetYear.value
  const endOfYear = new Date(year, 11, 31) // 12月31日
  const today = new Date()
  const diff = endOfYear.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const stats = ref({
    totalGoal: 0,
    currentIncome: 0,
    progress: 0,
    daysLeft: 0,
    totalTasks: 0,
    completedTasks: 0
})

const tasks = ref<any[]>([])
const notifications = ref<any[]>([])
const loadingTasks = ref(true)
const showModal = ref(false)
const selectedTask = ref<any>(null)

async function refreshData() {
    loadingTasks.value = true
    try {
        const [statsData, tasksData, notifData] = await Promise.all([
            $fetch('/api/dashboard/stats'),
            $fetch('/api/tasks?status=todo'),
            $fetch('/api/interactions/recent')
        ])
        if (statsData) stats.value = statsData as any
        if (tasksData) tasks.value = tasksData as any
        if (notifData) notifications.value = notifData as any
    } catch (e) {
        console.error(e)
    } finally {
        loadingTasks.value = false
    }
}

async function toggleTask(task: any) {
    const originalStatus = task.status
    const newStatus = originalStatus === 'done' ? 'todo' : 'done'
    task.status = newStatus
    
    try {
        await $fetch(`/api/tasks/${task.id}`, {
            method: 'PATCH',
            body: { status: newStatus }
        })
        refreshData() 
    } catch (e) {
        task.status = originalStatus 
        alert('Update failed')
    }
}

function openTask(task: any) {
    selectedTask.value = task
    showModal.value = true
}

async function updateTask(updated: any) {
     try {
        await $fetch(`/api/tasks/${updated.id}`, {
            method: 'PATCH',
            body: { name: updated.name } 
        })
        refreshData()
    } catch (e) {
        console.error(e)
    }
}

async function completeTask(task: any) {
    toggleTask(task)
}

async function deleteTask(task: any) {
    try {
        await $fetch(`/api/tasks/${task.id}`, {
            method: 'DELETE'
        })
        refreshData()
    } catch (e) {
        alert('Delete failed')
    }
}
onMounted(() => {
    refreshData()
})
</script>

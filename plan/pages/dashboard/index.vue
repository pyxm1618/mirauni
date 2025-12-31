<template>
  <div class="space-y-6">
    
    <!-- 1. Split Hero Section (Full Width, Equal Height) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        <!-- Left: Money Vault (2/3) -->
        <div class="md:col-span-2 bg-yellow-400 rounded-3xl border-4 border-black shadow-hard p-8 relative overflow-hidden flex flex-col justify-between min-h-[300px] group hover:scale-[1.005] transition-transform">
            <div class="relative z-10">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <div class="text-sm font-black uppercase tracking-widest bg-black text-white inline-block px-3 py-1 mb-2 transform -rotate-2 border-2 border-transparent">2026 GOAL</div>
                        <div class="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-1">
                            {{ formatNumber(stats.totalGoal) }} 
                            <span class="text-4xl stroke-text text-black/20">CNY</span>
                        </div>
                    </div>
                     <div class="text-right hidden md:block">
                        <div class="text-xs font-bold opacity-60 uppercase tracking-widest">Year End</div>
                        <div class="text-4xl font-black font-mono">{{ daysLeftInYear }}<span class="text-sm ml-1">Days</span></div>
                    </div>
                </div>
                
                <div class="text-xl font-bold opacity-80 border-l-4 border-black pl-4 mb-8">
                    距离目标还差 <span class="font-black text-2xl">{{ formatNumber(stats.totalGoal - stats.currentIncome) }}</span>，别睡了！
                </div>
            </div>
            
            <div class="relative z-10 w-full bg-white border-3 border-black rounded-xl p-4 shadow-sm">
                 <div class="flex justify-between text-xs font-black mb-2 uppercase tracking-wide">
                    <span>Progress: {{ stats.progress.toFixed(1) }}%</span>
                    <span>Collected: {{ formatNumber(stats.currentIncome) }}</span>
                 </div>
                 <div class="h-8 bg-gray-200 border-2 border-black rounded-lg overflow-hidden relative">
                    <div class="h-full bg-black relative flex items-center justify-end px-2" :style="{ width: `${Math.min(stats.progress, 100)}%` }">
                        <span class="text-white text-[10px] font-bold" v-if="stats.progress > 5">{{ Math.floor(stats.progress) }}%</span>
                    </div>
                    <!-- Stripes pattern overlay -->
                    <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px);"></div>
                 </div>
            </div>
            
            <!-- Decor -->
            <div class="absolute right-[-40px] top-[-40px] w-60 h-60 bg-white border-4 border-black rounded-full opacity-10 pointer-events-none"></div>
            <UIcon name="i-lucide-banknote" class="absolute right-8 top-8 text-9xl opacity-5 rotate-12 pointer-events-none" />
        </div>

        <!-- Right: Supervision Monitor (1/3) -->
        <div class="bg-white rounded-3xl border-4 border-black shadow-hard p-1 flex flex-col relative overflow-hidden min-h-[300px] hover:scale-[1.005] transition-transform">
             <div class="bg-red-50 flex-1 rounded-[1.25rem] border-2 border-transparent p-5 flex flex-col justify-between relative overflow-hidden">
                 
                 <!-- Header -->
                 <div class="flex justify-between items-center z-10 relative">
                     <div class="font-black text-xl flex items-center gap-2">
                         <div class="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                         监控室
                     </div>
                     <div class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-black shadow-[2px_2px_0_0_#000]">LIVE</div>
                 </div>

                 <!-- Avatars -->
                 <div class="flex-1 flex flex-col items-center justify-center space-y-4 py-4 z-10 relative">
                     <!-- Real Supervisors -->
                     <div class="flex -space-x-3" v-if="supervisionData.supervisors.length > 0">
                         <div v-for="s in supervisionData.supervisors.slice(0,3)" :key="s.id" class="w-16 h-16 rounded-full border-4 border-black bg-white flex items-center justify-center font-bold text-xl shadow-sm z-10 transform hover:scale-110 hover:z-20 transition-all cursor-pointer overflow-hidden">
                             <img v-if="s.avatar_url" :src="s.avatar_url" class="w-full h-full object-cover">
                             <span v-else>{{ s.nickname?.[0] || '?' }}</span>
                         </div>
                         <div class="w-16 h-16 rounded-full border-4 border-dashed border-gray-400 bg-white/50 flex items-center justify-center z-0 text-gray-400 hover:border-black hover:text-black transition-colors cursor-pointer" @click="inviteFriend">
                             <UIcon name="i-lucide-plus" class="text-xl" />
                         </div>
                     </div>
                     <!-- Empty State -->
                     <div v-else class="text-center" @click="inviteFriend">
                         <div class="w-16 h-16 rounded-full border-4 border-dashed border-black mx-auto mb-2 flex items-center justify-center text-2xl cursor-pointer hover:bg-yellow-400 transition-colors">+</div>
                         <div class="font-bold text-sm">邀请好友监督</div>
                     </div>

                     <div class="text-center">
                         <div class="font-black text-2xl">{{ supervisionData.supervisors.length }}人正在围观</div>
                         <div class="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-black/10 inline-block mt-1">
                             已连续打卡 <span class="text-black bg-yellow-400 px-1 border border-black text-xs font-black rounded mx-1">7</span> 天
                         </div>
                         <div class="text-[10px] text-gray-400 mt-1">Don't break the chain.</div>
                     </div>
                 </div>

                 <!-- Footer Alert -->
                 <div class="relative z-10">
                     <div class="bg-black text-white p-3 rounded-xl text-center font-bold text-sm border-2 border-transparent shadow-hard-sm cursor-pointer hover:bg-red-600 transition-colors group/alert">
                         ⚠️ <span class="group-hover/alert:hidden">23小时后全网通报</span><span class="hidden group-hover/alert:inline">立即打卡保平安!</span>
                     </div>
                 </div>

                 <!-- Background Grid -->
                 <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px); background-size: 20px 20px;"></div>
             </div>
        </div>
    </div>

    <!-- 2. Action Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div @click="openCreateTask" class="bg-white border-4 border-black rounded-2xl p-4 shadow-hard-sm hover:-translate-y-1 transition-transform cursor-pointer flex items-center gap-4 group">
            <div class="w-12 h-12 bg-pink-400 border-2 border-black rounded-xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">⚡️</div>
            <div class="font-bold">快速记录任务</div>
        </div>
         <div class="bg-white border-4 border-black rounded-2xl p-4 shadow-hard-sm hover:-translate-y-1 transition-transform cursor-pointer flex items-center gap-4 group">
            <div class="w-12 h-12 bg-blue-400 border-2 border-black rounded-xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">💰</div>
            <div class="font-bold">记一笔收入</div>
        </div>
         <div to="/dashboard/projects" class="bg-white border-4 border-black rounded-2xl p-4 shadow-hard-sm hover:-translate-y-1 transition-transform cursor-pointer flex items-center gap-4 group">
            <div class="w-12 h-12 bg-green-400 border-2 border-black rounded-xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">📊</div>
            <div class="font-bold">项目分析</div>
        </div>
         <div @click="inviteFriend" class="bg-white border-4 border-black rounded-2xl p-4 shadow-hard-sm hover:-translate-y-1 transition-transform cursor-pointer flex items-center gap-4 group">
            <div class="w-12 h-12 bg-purple-400 border-2 border-black rounded-xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">💌</div>
            <div class="font-bold">邀请好友</div>
        </div>
    </div>

    <!-- 3. Current Tasks -->
    <div class="bg-white border-4 border-black rounded-3xl p-6 shadow-hard">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black flex items-center gap-2">
                <UIcon name="i-lucide-list-todo" class="text-yellow-500" />
                TODAY'S MISSION
            </h2>
            <UButton variant="ghost" color="gray" to="/dashboard/projects">查看全部 -></UButton>
        </div>
        
        <div class="space-y-4">
             <div v-if="loadingTasks" class="animate-pulse space-y-4">
                 <div v-for="i in 3" :key="i" class="h-16 bg-gray-100 rounded-xl border-2 border-transparent"></div>
             </div>

             <div v-else-if="tasks.length > 0">
                <TaskItem
                    v-for="task in tasks"
                    :key="task.id"
                    :task="task"
                    @toggle="toggleTask"
                    @click="openTask(task)"
                    class="hover:scale-[1.01] transition-transform border-4 border-transparent hover:border-black hover:bg-yellow-50 hover:shadow-hard-sm mb-3 rounded-2xl"
                />
             </div>

             <div v-else class="text-center py-12">
                 <div class="text-6xl mb-4">😴</div>
                 <div class="font-bold text-gray-400">Mission Clear! (or you are just lazy)</div>
             </div>
        </div>
    </div>

    <!-- Modals -->
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
import TaskItem from '~/components/task/TaskItem.vue'
import TaskDetailModal from '~/components/task/TaskDetailModal.vue'

definePageMeta({
    layout: 'default'
})

// Data Logic
const stats = ref({
    totalGoal: 0,
    currentIncome: 0,
    progress: 0,
    daysLeft: 0,
    totalTasks: 0,
    completedTasks: 0
})

const tasks = ref<any[]>([])
const supervisionData = ref({
    supervisors: [],
    interactions: [],
    alertLevel: 'normal'
})

const loadingTasks = ref(true)
const showModal = ref(false)
const selectedTask = ref<any>(null)

// Computed
const now = new Date()
const targetYear = computed(() => {
  const month = now.getMonth()
  return month >= 9 ? now.getFullYear() + 1 : now.getFullYear()
})
const daysLeftInYear = computed(() => {
  const year = targetYear.value
  const endOfYear = new Date(year, 11, 31)
  const today = new Date()
  const diff = endOfYear.getTime() - today.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

// Formatting
function formatNumber(num: number) {
    if (!num) return '0'
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
    }
    return num.toLocaleString()
}

// Fetch Logic
async function refreshData() {
    loadingTasks.value = true
    try {
        const [statsData, tasksData, superData] = await Promise.all([
            $fetch('/api/dashboard/stats'),
            $fetch('/api/tasks?status=todo'),
            $fetch('/api/dashboard/supervision')
        ])
        if (statsData) stats.value = statsData as any
        if (tasksData) tasks.value = tasksData as any
        if (superData) supervisionData.value = superData as any
    } catch (e) {
        console.error('Failed to load dashboard data', e)
    } finally {
        loadingTasks.value = false
    }
}

// Interaction Handlers
function openTask(task: any) {
    selectedTask.value = task
    showModal.value = true
}

function openCreateTask() {
    // Placeholder for create task logic, maybe open a modal in future
    alert('Quick Create Task coming soon!')
}

function inviteFriend() {
    // Navigate to invite page or copy link
    alert('Copy invite link!')
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
        console.error(e)
    }
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
        console.error(e)
    }
}

onMounted(() => {
    refreshData()
})
</script>

<style scoped>
.shadow-hard {
    box-shadow: 8px 8px 0px 0px #000;
}
.shadow-hard-sm {
    box-shadow: 4px 4px 0px 0px #000;
}
.stroke-text {
    -webkit-text-stroke: 1px black;
    color: transparent;
}
</style>

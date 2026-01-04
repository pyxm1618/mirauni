<template>
  <div class="space-y-6">
    
    <!-- 1. Split Hero Section (Full Width, Equal Height) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        <!-- Left: Money Vault (2/3) -->
        <div class="md:col-span-2 bg-yellow-400 rounded-3xl border-4 border-black shadow-hard p-8 relative overflow-hidden flex flex-col justify-between min-h-[300px] group hover:scale-[1.005] transition-transform">
            <div class="relative z-10">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <div class="text-sm font-black uppercase tracking-widest bg-black text-white inline-block px-3 py-1 mb-2 transform -rotate-2 border-2 border-transparent">{{ $t('dashboard.sections.goal_card_label') }}</div>
                        <!-- 骨架屏：加载中且无缓存 -->
                        <div v-if="statsLoading" class="animate-pulse">
                            <div class="h-16 md:h-24 w-48 bg-black/20 rounded-xl mb-2"></div>
                        </div>
                        <!-- 真实数据 -->
                        <div v-else class="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-1 whitespace-nowrap">
                            {{ formatNumber(stats?.totalGoal || 0) }}<span class="text-4xl font-bold ml-1">元</span>
                        </div>
                    </div>
                     <div class="text-right hidden md:block">
                        <div class="flex flex-col items-end gap-2">
                             <UButton 
                                color="white" 
                                variant="solid" 
                                icon="i-lucide-receipt"
                                size="xs"
                                class="border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rotate-1"
                                @click="navigateTo('/dashboard/income')"
                            >
                                账本
                            </UButton>
                            <div>
                                <div class="text-xs font-bold opacity-60 uppercase tracking-widest mt-2">{{ $t('dashboard.sections.year_end_label') }}</div>
                                <div class="text-4xl font-black font-mono leading-none">{{ daysLeftInYear }}<span class="text-sm ml-1">{{ $t('common.days') }}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 距离目标 -->
                <div v-if="statsLoading" class="animate-pulse mb-8">
                    <div class="h-6 w-64 bg-black/20 rounded-lg"></div>
                </div>
                <div v-else class="text-xl font-bold opacity-80 border-l-4 border-black pl-4 mb-8">
                    {{ $t('dashboard.sections.distance_goal') }} <span class="font-black text-2xl">{{ formatNumber((stats?.totalGoal || 0) - (stats?.currentIncome || 0)) }}</span>{{ $t('dashboard.sections.distance_goal_suffix') }}
                </div>
            </div>
            
            <!-- 进度条区域 -->
            <div v-if="statsLoading" class="relative z-10 w-full bg-white/50 border-3 border-black/30 rounded-xl p-4 shadow-sm animate-pulse">
                <div class="flex justify-between mb-2">
                    <div class="h-3 w-24 bg-gray-300 rounded"></div>
                    <div class="h-3 w-20 bg-gray-300 rounded"></div>
                </div>
                <div class="h-8 bg-gray-200 border-2 border-black/30 rounded-lg"></div>
            </div>
            <div v-else class="relative z-10 w-full bg-white border-3 border-black rounded-xl p-4 shadow-sm">
                 <div class="flex justify-between text-xs font-black mb-2 uppercase tracking-wide">
                    <span>{{ $t('dashboard.sections.progress') }}: {{ Number(stats?.progress || 0).toFixed(2) }}%</span>
                    <span>{{ $t('dashboard.sections.collected') }}: {{ formatNumber(stats?.currentIncome || 0) }}</span>
                 </div>
                 <div class="h-8 bg-gray-200 border-2 border-black rounded-lg overflow-hidden relative">
                    <div class="h-full bg-black relative flex items-center justify-end px-2" :style="{ width: `${Math.min(Number(stats?.progress || 0), 100)}%` }">
                        <span class="text-white text-[10px] font-bold" v-if="Number(stats?.progress || 0) > 5">{{ Math.floor(Number(stats?.progress || 0)) }}%</span>
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
                         {{ $t('dashboard.sections.monitor_room') }}
                     </div>
                     <div class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-black shadow-[2px_2px_0_0_#000]">{{ $t('dashboard.sections.live') }}</div>
                 </div>

                 <!-- Avatars -->
                 <div class="flex-1 flex flex-col items-center justify-center space-y-4 py-4 z-10 relative">
                     <!-- Real Supervisors -->
                     <div class="flex -space-x-3" v-if="supervisionData.supervisors.length > 0">
                         <div v-for="s in supervisionData.supervisors.slice(0,3)" :key="s.id" class="w-16 h-16 rounded-full border-4 border-black bg-white flex items-center justify-center font-bold text-xl shadow-sm z-10 transform hover:scale-110 hover:z-20 transition-all cursor-pointer overflow-hidden" :title="s.supervisor_nickname || '监督者'">
                             <img v-if="s.supervisor_avatar" :src="s.supervisor_avatar" class="w-full h-full object-cover">
                             <span v-else>{{ s.supervisor_nickname?.[0] || '?' }}</span>
                         </div>
                         <div class="w-16 h-16 rounded-full border-4 border-dashed border-gray-400 bg-white/50 flex items-center justify-center z-0 text-gray-400 hover:border-black hover:text-black transition-colors cursor-pointer" @click="inviteFriend">
                             <UIcon name="i-lucide-plus" class="text-xl" />
                         </div>
                     </div>
                     <!-- Empty State -->
                     <div v-else class="text-center" @click="inviteFriend">
                         <div class="w-16 h-16 rounded-full border-4 border-dashed border-black mx-auto mb-2 flex items-center justify-center text-2xl cursor-pointer hover:bg-yellow-400 transition-colors">+</div>
                         <div class="font-bold text-sm">{{ $t('dashboard.sections.invite_title') }}</div>
                     </div>

                     <div class="text-center">
                         <div class="font-black text-2xl">{{ supervisionData.supervisors.length }}{{ $t('dashboard.sections.watching') }}</div>
                         <div class="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-black/10 inline-block mt-1">
                             {{ $t('dashboard.sections.streak_prefix') }} <span class="text-black bg-yellow-400 px-1 border border-black text-xs font-black rounded mx-1">{{ supervisionData.checkinStreak || 0 }}</span> {{ $t('dashboard.sections.streak_suffix') }}
                         </div>
                         <div class="text-[10px] text-gray-400 mt-1">{{ $t('dashboard.sections.dont_break_chain') }}</div>
                     </div>

                     <!-- Interaction Notifications -->
                     <div v-if="supervisionData.interactions?.length" class="w-full px-4 animate-fade-in-up">
                        <div class="bg-white/80 backdrop-blur-sm border-2 border-black rounded-xl p-2 text-xs font-bold text-left space-y-1.5 shadow-sm">
                            <div v-for="action in supervisionData.interactions.slice(0, 2)" :key="action.id" class="flex items-center gap-2 truncate">
                                <span class="bg-yellow-400 border border-black rounded p-0.5 text-[10px] w-5 h-5 flex items-center justify-center shrink-0">
                                    {{ action.type === 'like' ? '👍' : '⏰' }}
                                </span>
                                <div class="truncate">
                                    <span class="mr-1">{{ action.sender_nickname }}</span>
                                    <span class="text-gray-500 font-normal">
                                        {{ action.type === 'like' ? '给你的搞钱计划点赞了' : '正在催你搞钱！' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                     </div>
                 </div>

                 <!-- Footer Alert -->
                 <div class="relative z-10">
                     <div class="bg-black text-white p-3 rounded-xl text-center font-bold text-sm border-2 border-transparent shadow-hard-sm cursor-pointer hover:bg-red-600 transition-colors group/alert" @click="checkIn">
                         ⚠️ <span class="group-hover/alert:hidden">{{ $t('dashboard.sections.alert_in') }}</span><span class="hidden group-hover/alert:inline">{{ $t('dashboard.sections.alert_now') }}</span>
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
            <div class="font-bold">{{ $t('dashboard.actions.quick_record') }}</div>
        </div>
         <div @click="openIncomeModal" class="bg-white border-4 border-black rounded-2xl p-4 shadow-hard-sm hover:-translate-y-1 transition-transform cursor-pointer flex items-center gap-4 group">
            <div class="w-12 h-12 bg-blue-400 border-2 border-black rounded-xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">💰</div>
            <div class="font-bold">{{ $t('dashboard.actions.record_income') }}</div>
        </div>
         <div @click="goToProjects" class="bg-white border-4 border-black rounded-2xl p-4 shadow-hard-sm hover:-translate-y-1 transition-transform cursor-pointer flex items-center gap-4 group">
            <div class="w-12 h-12 bg-green-400 border-2 border-black rounded-xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">📊</div>
            <div class="font-bold">{{ $t('dashboard.actions.project_analysis') }}</div>
        </div>
         <div @click="inviteFriend" class="bg-white border-4 border-black rounded-2xl p-4 shadow-hard-sm hover:-translate-y-1 transition-transform cursor-pointer flex items-center gap-4 group">
            <div class="w-12 h-12 bg-purple-400 border-2 border-black rounded-xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">💌</div>
            <div class="font-bold">{{ $t('dashboard.actions.invite_friend') }}</div>
        </div>
    </div>

    <!-- 3. Task List with Date Tabs -->
    <div class="bg-white border-4 border-black rounded-3xl p-6 shadow-hard">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 class="text-2xl font-black flex items-center gap-2">
                <UIcon name="i-lucide-list-todo" class="text-yellow-500" />
                {{ $t('dashboard.sections.todays_mission') }}
            </h2>
            <div class="flex items-center gap-2">
                <!-- Date Tabs -->
                <div class="flex bg-gray-100 rounded-xl p-1 border-2 border-black">
                    <button 
                        v-for="tab in dateTabs" 
                        :key="tab.value"
                        @click="selectDateTab(tab.value)"
                        :class="[
                            'px-3 py-1 rounded-lg text-sm font-bold transition-all',
                            activeDateTab === tab.value 
                                ? 'bg-black text-white' 
                                : 'text-gray-600 hover:text-black'
                        ]"
                    >
                        {{ tab.label }}
                        <span v-if="tab.count !== undefined" class="ml-1 text-xs opacity-70">({{ tab.count }})</span>
                    </button>
                </div>
                <!-- Calendar Button -->
                <UButton
                    variant="solid"
                    color="white"
                    icon="i-lucide-calendar"
                    class="border-2 border-black text-black hover:bg-gray-100"
                    to="/calendar"
                />
                <UButton variant="ghost" color="gray" to="/dashboard/projects">{{ $t('dashboard.sections.view_all') }} -></UButton>
            </div>
        </div>
        
        <div class="space-y-4">
             <div v-if="loadingTasks" class="animate-pulse space-y-4">
                 <div v-for="i in 3" :key="i" class="h-16 bg-gray-100 rounded-xl border-2 border-transparent"></div>
             </div>

             <div v-else-if="filteredTasks.length > 0">
                <TaskItem
                    v-for="task in filteredTasks"
                    :key="task.id"
                    :task="task"
                    @toggle="toggleTask"
                    @click="openTask(task)"
                    class="hover:scale-[1.01] transition-transform border-4 border-transparent hover:border-black hover:bg-yellow-50 hover:shadow-hard-sm mb-3 rounded-2xl"
                />
             </div>

             <div v-else class="text-center py-12">
                 <div class="text-6xl mb-4">{{ activeDateTab === 'today' ? '😴' : '📅' }}</div>
                 <div class="font-bold text-gray-400">
                     {{ activeDateTab === 'today' ? $t('dashboard.sections.mission_clear') : '暂无任务安排' }}
                 </div>
                 <p class="text-sm text-gray-300 mt-2" v-if="activeDateTab !== 'today'">
                     点击下方按钮，系统会自动将任务分配到每一天
                 </p>
                 <UButton 
                     @click="generateSchedule" 
                     :loading="generatingSchedule"
                     color="black" 
                     class="mt-4"
                     v-if="tasks.length > 0"
                 >
                     🗓️ 生成日程安排
                 </UButton>
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

    <QuickTaskModal
      v-model="showQuickTaskModal"
      @created="refreshData"
    />

    <IncomeModal
      v-model="showIncomeModal"
      @saved="refreshData"
    />

  </div>
</template>

<script setup lang="ts">
import TaskItem from '~/components/task/TaskItem.vue'
import TaskDetailModal from '~/components/task/TaskDetailModal.vue'
import QuickTaskModal from '~/components/task/QuickTaskModal.vue'
import IncomeModal from '~/components/task/IncomeModal.vue'
import { useDashboardStore, type DashboardStats, type SupervisionData } from '~/stores/dashboard'

definePageMeta({
    layout: 'default'
})

const { t } = useI18n()

// Dashboard Store for SWR caching
const dashboardStore = useDashboardStore()

// Data Logic - 初始值优先从缓存读取（SWR 模式核心）
const stats = ref<DashboardStats | null>(dashboardStore.cachedStats)
const tasks = ref<any[]>(dashboardStore.cachedTasks || [])
const supervisionData = ref<SupervisionData>(dashboardStore.cachedSupervision || {
    supervisors: [],
    interactions: [],
    alertLevel: 'normal',
    checkinStreak: 0
})

// Client-side Data Fetching (Non-blocking)
const { data: dashboardData, pending: isLoading, refresh } = useAsyncData('dashboard-data', async () => {
    const [statsResult, tasksResult, superResult] = await Promise.all([
        $fetch('/api/dashboard/stats'),
        $fetch('/api/tasks?status=todo'),
        $fetch('/api/dashboard/supervision')
    ])
    return {
        stats: statsResult,
        tasks: tasksResult,
        supervision: superResult
    }
}, { server: false, lazy: true })

// 骨架屏显示条件：正在加载 且 没有缓存数据（必须在 isLoading 定义之后）
const statsLoading = computed(() => isLoading.value && stats.value === null)

// Sync data seamlessly + update cache for SWR
watch(dashboardData, (newData) => {
    if (newData) {
        if (newData.stats) stats.value = newData.stats as DashboardStats
        if (newData.tasks) tasks.value = newData.tasks as any[]
        if (newData.supervision) supervisionData.value = newData.supervision as SupervisionData
        // 更新缓存，下次访问可直接使用
        dashboardStore.updateCache({
            stats: newData.stats as DashboardStats,
            supervision: newData.supervision as SupervisionData,
            tasks: newData.tasks as any[]
        })
    }
}, { immediate: true })

const loadingTasks = computed(() => isLoading.value)
const showModal = ref(false)
const showQuickTaskModal = ref(false)
const showIncomeModal = ref(false)
const selectedTask = ref<any>(null)

// Date Tab Logic
const activeDateTab = ref<'today' | 'tomorrow' | 'week'>('today')

// Helper for Local YYYY-MM-DD
function getLocalDateStr(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dateTabs = computed(() => {
    const today = new Date()
    // today.setHours(0, 0, 0, 0) // Not strictly needed for string gen but good for logic
    const todayStr = getLocalDateStr(today)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = getLocalDateStr(tomorrow)
    
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)
    
    // Count tasks for each tab
    const todayCount = tasks.value.filter(t => t.planned_date === todayStr).length
    const tomorrowCount = tasks.value.filter(t => t.planned_date === tomorrowStr).length
    const weekCount = tasks.value.filter(t => {
        if (!t.planned_date) return false
        const d = new Date(t.planned_date)
        const dStr = getLocalDateStr(d)
        // Compare strings or timestamps
        return dStr >= todayStr && d <= weekEnd
    }).length

    return [
        { label: '今日', value: 'today' as const, count: todayCount },
        { label: '明日', value: 'tomorrow' as const, count: tomorrowCount },
        { label: '本周', value: 'week' as const, count: weekCount }
    ]
})

const filteredTasks = computed(() => {
    const today = new Date()
    const todayStr = getLocalDateStr(today)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = getLocalDateStr(tomorrow)
    
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)

    if (activeDateTab.value === 'today') {
        // 今日：planned_date = today OR planned_date is null (旧任务兼容)
        return tasks.value.filter(t => t.planned_date === todayStr || !t.planned_date)
    } else if (activeDateTab.value === 'tomorrow') {
        return tasks.value.filter(t => t.planned_date === tomorrowStr)
    } else {
        // 本周
        return tasks.value.filter(t => {
            if (!t.planned_date) return false
            const d = new Date(t.planned_date)
            // Fix comparison
             const dStr = getLocalDateStr(d)
            return dStr >= todayStr && d <= weekEnd
        })
    }
})

function selectDateTab(tab: 'today' | 'tomorrow' | 'week') {
    activeDateTab.value = tab
}

// ...

// 确保从 Wizard 跳转过来时强制刷新最新数据（覆盖 SWR 缓存）
onMounted(() => {
    refresh()
})

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

// Formatting: 显示为元，整数，千位用逗号分隔
function formatNumber(num: number) {
    if (!num && num !== 0) return '0'
    return Math.round(num).toLocaleString('zh-CN')
}

// Fetch Logic
// Refresh wrapper
async function refreshData() {
    await refresh()
}

// Interaction Handlers
function openTask(task: any) {
    selectedTask.value = task
    showModal.value = true
}

function openCreateTask() {
    showQuickTaskModal.value = true
}

function openIncomeModal() {
    showIncomeModal.value = true
}

function goToProjects() {
    navigateTo('/dashboard/analytics')
}

function inviteFriend() {
    navigateTo('/dashboard/invite')
}

const toast = useToast()

async function checkIn() {
    try {
        await $fetch('/api/checkin', { method: 'POST' })
        await refreshData()
        toast.add({
            title: '打卡成功',
            description: '今日签到完成，继续加油！',
            color: 'green'
        })
    } catch (e: any) {
        toast.add({
            title: '打卡失败',
            description: e.message || '请稍后再试',
            color: 'red'
        })
    }
}

// Schedule Generation
const generatingSchedule = ref(false)

async function generateSchedule() {
    generatingSchedule.value = true
    try {
        const result = await $fetch('/api/planning/generate', { method: 'POST' }) as any
        await refreshData()
        toast.add({
            title: '日程生成成功！',
            description: result.message || `已为 ${result.tasks_updated} 个任务分配执行日期`,
            color: 'green'
        })
    } catch (e: any) {
        toast.add({
            title: '生成失败',
            description: e.message || '请稍后再试',
            color: 'red'
        })
    } finally {
        generatingSchedule.value = false
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

// onMounted not needed for initial fetch anymore due to useAsyncData

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
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
}
</style>

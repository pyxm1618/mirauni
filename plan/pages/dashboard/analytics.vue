<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-black flex items-center gap-3">
        <UIcon name="i-lucide-bar-chart-3" class="text-yellow-500" />
        项目分析
      </h1>
      <UButton variant="ghost" color="gray" to="/dashboard" icon="i-lucide-arrow-left">
        返回看板
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <div class="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
        <div class="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
      </div>
    </div>

    <template v-else>
      <!-- 1. Progress Overview -->
      <div class="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl border-4 border-black shadow-hard p-8 relative overflow-hidden">
        <div class="flex flex-col md:flex-row items-center gap-8">
          <!-- Donut Chart -->
          <div class="relative w-48 h-48 flex-shrink-0">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <!-- Background circle -->
              <circle
                cx="50" cy="50" r="40"
                stroke="#00000020"
                stroke-width="12"
                fill="none"
              />
              <!-- Progress circle -->
              <circle
                cx="50" cy="50" r="40"
                stroke="#000"
                stroke-width="12"
                fill="none"
                :stroke-dasharray="`${progressCircle} 251.2`"
                stroke-linecap="round"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-4xl font-black">{{ Number(analytics.progress || 0).toFixed(0) }}%</span>
              <span class="text-xs font-bold opacity-80">年度进度</span>
            </div>
          </div>
          
          <!-- Stats -->
          <div class="flex-1 space-y-4 text-center md:text-left">
            <div>
              <div class="text-sm font-black uppercase tracking-widest opacity-80">年度目标</div>
              <div class="text-5xl font-black">¥{{ formatNumber(analytics.totalGoal) }}</div>
            </div>
            <div class="flex flex-wrap gap-6 justify-center md:justify-start">
              <div class="bg-white/30 backdrop-blur rounded-xl px-4 py-2 border-2 border-black/20">
                <div class="text-xs font-bold opacity-70">已入账</div>
                <div class="text-xl font-black">¥{{ formatNumber(analytics.currentIncome) }}</div>
              </div>
              <div class="bg-white/30 backdrop-blur rounded-xl px-4 py-2 border-2 border-black/20">
                <div class="text-xs font-bold opacity-70">差距</div>
                <div class="text-xl font-black">¥{{ formatNumber(analytics.gap) }}</div>
              </div>
              <div class="bg-white/30 backdrop-blur rounded-xl px-4 py-2 border-2 border-black/20">
                <div class="text-xs font-bold opacity-70">剩余</div>
                <div class="text-xl font-black">{{ analytics.daysLeft }} 天</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Decorative -->
        <UIcon name="i-lucide-target" class="absolute right-4 top-4 text-8xl opacity-10" />
      </div>

      <!-- 2 & 3. Path Comparison + Milestones -->
      <div class="grid md:grid-cols-2 gap-6">
        
        <!-- Path Comparison -->
        <div class="bg-white rounded-3xl border-4 border-black shadow-hard p-6">
          <h2 class="text-xl font-black mb-6 flex items-center gap-2">
            <UIcon name="i-lucide-git-branch" class="text-purple-500" />
            路径对比分析
          </h2>
          
          <div v-if="analytics.paths.length > 0" class="space-y-5">
            <div v-for="path in analytics.paths" :key="path.id" class="space-y-2">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="font-bold">{{ path.name }}</span>
                  <UBadge size="xs" color="gray">{{ path.weight }}%</UBadge>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold">{{ path.completionRate?.toFixed(0) || 0 }}%</span>
                  <div 
                    class="w-3 h-3 rounded-full border-2 border-black"
                    :class="getStatusColor(path.status)"
                  ></div>
                </div>
              </div>
              <div class="h-4 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                <div 
                  class="h-full transition-all duration-500"
                  :class="getBarColor(path.status)"
                  :style="{ width: `${path.completionRate || 0}%` }"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-gray-500">
                <span>{{ path.tasksCompleted }}/{{ path.tasksTotal }} 任务</span>
                <span v-if="path.incomeContribution">贡献 ¥{{ formatNumber(path.incomeContribution) }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-400">
            <UIcon name="i-lucide-folder-open" class="text-4xl mb-2" />
            <p>暂无路径数据</p>
          </div>
        </div>

        <!-- Active Milestones -->
        <div class="bg-white rounded-3xl border-4 border-black shadow-hard p-6">
          <h2 class="text-xl font-black mb-6 flex items-center gap-2">
            <UIcon name="i-lucide-flag" class="text-green-500" />
            当前里程碑
          </h2>
          
          <div v-if="analytics.milestones.length > 0" class="space-y-4">
            <div 
              v-for="ms in analytics.milestones" 
              :key="ms.id"
              class="p-4 rounded-xl border-3 border-black bg-gray-50 hover:bg-yellow-50 transition-colors"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="font-black">{{ ms.name }}</div>
                  <div class="text-xs text-gray-500">{{ ms.pathName }}</div>
                </div>
                <UBadge v-if="ms.isDelayed" color="red" size="xs">
                  ⚠️ 延期{{ ms.delayDays }}天
                </UBadge>
                <UBadge v-else color="green" size="xs">
                  进行中
                </UBadge>
              </div>
              <div class="h-3 bg-gray-200 rounded-full border border-black overflow-hidden mb-2">
                <div 
                  class="h-full bg-green-500"
                  :style="{ width: `${ms.completionRate || 0}%` }"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-gray-600">
                <span>{{ ms.tasksCompleted }}/{{ ms.tasksTotal }} 任务完成</span>
                <span v-if="ms.endDate">截止 {{ formatDate(ms.endDate) }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-400">
            <UIcon name="i-lucide-milestone" class="text-4xl mb-2" />
            <p>暂无活跃里程碑</p>
          </div>
        </div>
      </div>

      <!-- 4. Weekly Stats -->
      <div class="bg-white rounded-3xl border-4 border-black shadow-hard p-6">
        <h2 class="text-xl font-black mb-6 flex items-center gap-2">
          <UIcon name="i-lucide-calendar-check" class="text-blue-500" />
          本周执行统计
        </h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 rounded-xl bg-blue-50 border-3 border-black">
            <div class="text-3xl font-black">{{ analytics.weekly.tasksCompleted }}</div>
            <div class="text-sm font-bold text-gray-600">完成任务</div>
            <div 
              v-if="analytics.weekly.tasksDiff !== 0"
              class="text-xs mt-1"
              :class="analytics.weekly.tasksDiff > 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ analytics.weekly.tasksDiff > 0 ? '+' : '' }}{{ analytics.weekly.tasksDiff }} vs 上周
            </div>
          </div>
          
          <div class="text-center p-4 rounded-xl bg-green-50 border-3 border-black">
            <div class="text-3xl font-black">{{ analytics.weekly.hoursSpent }}h</div>
            <div class="text-sm font-bold text-gray-600">投入时长</div>
          </div>
          
          <div class="text-center p-4 rounded-xl bg-yellow-50 border-3 border-black">
            <div class="text-3xl font-black">{{ analytics.weekly.avgDaily.toFixed(1) }}</div>
            <div class="text-sm font-bold text-gray-600">日均任务</div>
          </div>
          
          <div class="text-center p-4 rounded-xl bg-purple-50 border-3 border-black">
            <div class="text-3xl font-black">{{ analytics.weekly.streakDays }}</div>
            <div class="text-sm font-bold text-gray-600">连续打卡</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

interface PathAnalytics {
  id: string
  name: string
  weight: number
  completionRate: number
  tasksCompleted: number
  tasksTotal: number
  incomeContribution: number
  status: 'good' | 'warning' | 'danger'
}

interface MilestoneAnalytics {
  id: string
  name: string
  pathName: string
  completionRate: number
  tasksCompleted: number
  tasksTotal: number
  endDate: string | null
  isDelayed: boolean
  delayDays: number
}

interface AnalyticsData {
  totalGoal: number
  currentIncome: number
  progress: number
  gap: number
  daysLeft: number
  paths: PathAnalytics[]
  milestones: MilestoneAnalytics[]
  weekly: {
    tasksCompleted: number
    tasksDiff: number
    hoursSpent: number
    avgDaily: number
    streakDays: number
  }
}

const loading = ref(true)
const analytics = ref<AnalyticsData>({
  totalGoal: 0,
  currentIncome: 0,
  progress: 0,
  gap: 0,
  daysLeft: 0,
  paths: [],
  milestones: [],
  weekly: {
    tasksCompleted: 0,
    tasksDiff: 0,
    hoursSpent: 0,
    avgDaily: 0,
    streakDays: 0
  }
})

const progressCircle = computed(() => {
  const percent = Math.min(Number(analytics.value.progress || 0), 100)
  return (percent / 100) * 251.2 // 2 * π * 40
})

function formatNumber(num: number) {
  if (!num && num !== 0) return '0'
  return Math.round(num).toLocaleString('zh-CN')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'good': return 'bg-green-500'
    case 'warning': return 'bg-yellow-500'
    case 'danger': return 'bg-red-500'
    default: return 'bg-gray-300'
  }
}

function getBarColor(status: string) {
  switch (status) {
    case 'good': return 'bg-green-500'
    case 'warning': return 'bg-yellow-500'
    case 'danger': return 'bg-red-500'
    default: return 'bg-gray-400'
  }
}

async function fetchAnalytics() {
  loading.value = true
  try {
    const data = await $fetch<AnalyticsData>('/api/dashboard/analytics')
    analytics.value = data
  } catch (e) {
    console.error('Failed to fetch analytics:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnalytics()
})
</script>

<style scoped>
.shadow-hard {
  box-shadow: 8px 8px 0px 0px #000;
}
</style>

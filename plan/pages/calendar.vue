<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <h1 class="text-3xl md:text-5xl font-black mb-1">📅 日历视图</h1>
        <p class="text-gray-500 font-medium">查看你的任务安排、收入和打卡记录</p>
      </div>
      <div class="flex gap-2">
        <UButton variant="outline" color="gray" icon="i-lucide-chevron-left" @click="prevMonth" />
        <UButton variant="outline" color="gray" class="min-w-32">{{ currentMonth }}</UButton>
        <UButton variant="outline" color="gray" icon="i-lucide-chevron-right" @click="nextMonth" />
        <UButton color="black" @click="goToToday">今天</UButton>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white border-3 border-black rounded-xl p-4 shadow-hard-sm">
            <div class="text-xs font-bold text-gray-500 uppercase">任务数</div>
            <div class="text-2xl font-black">{{ summary.totalTasks }}</div>
        </div>
        <div class="bg-white border-3 border-black rounded-xl p-4 shadow-hard-sm">
            <div class="text-xs font-bold text-gray-500 uppercase">已完成</div>
            <div class="text-2xl font-black text-green-600">{{ summary.completedTasks }}</div>
        </div>
        <div class="bg-white border-3 border-black rounded-xl p-4 shadow-hard-sm">
            <div class="text-xs font-bold text-gray-500 uppercase">收入</div>
            <div class="text-2xl font-black text-yellow-600">¥{{ summary.totalIncome }}</div>
        </div>
        <div class="bg-white border-3 border-black rounded-xl p-4 shadow-hard-sm">
            <div class="text-xs font-bold text-gray-500 uppercase">打卡天数</div>
            <div class="text-2xl font-black text-red-500">{{ summary.checkinDays }}</div>
        </div>
    </div>

    <!-- Calendar Grid -->
    <div class="bg-white border-3 border-black rounded-xl shadow-hard overflow-hidden">
      <!-- Days Header -->
      <div class="grid grid-cols-7 border-b-3 border-black">
        <div v-for="day in weekDays" :key="day" class="p-3 text-center font-bold text-sm bg-gray-50 border-r last:border-r-0 border-black">
          {{ day }}
        </div>
      </div>
      
      <!-- Calendar Days -->
      <div class="grid grid-cols-7">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index"
          class="min-h-24 p-2 border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-yellow-50 transition-colors"
          :class="{
            'bg-gray-100 text-gray-400': !day.isCurrentMonth,
            'bg-toon-50': day.isToday
          }"
          @click="openDayDetail(day)"
        >
          <div class="flex justify-between items-start">
            <span 
              class="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold"
              :class="{
                'bg-black text-white': day.isToday,
                'text-gray-400': !day.isCurrentMonth
              }"
            >
              {{ day.date }}
            </span>
            <span v-if="day.data?.checkedIn" class="text-orange-500">🔥</span>
          </div>
          <!-- Task Preview -->
          <div v-if="day.data?.tasks?.length > 0" class="mt-1 space-y-1">
            <div 
              v-for="task in day.data.tasks.slice(0, 2)" 
              :key="task.id"
              class="text-xs truncate px-1 py-0.5 rounded"
              :class="task.status === 'done' ? 'bg-green-100 text-green-700 line-through' : 'bg-toon-100 text-toon-700'"
            >
              {{ task.name }}
            </div>
            <div v-if="day.data.tasks.length > 2" class="text-xs text-gray-400 px-1">
              +{{ day.data.tasks.length - 2 }} 更多
            </div>
          </div>
          <!-- Income Preview -->
          <div v-if="day.data?.income?.length > 0" class="mt-1 text-xs text-green-600 font-bold px-1">
            💰 +¥{{ day.data.income.reduce((s: number, i: any) => s + Number(i.amount), 0) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Day Detail Modal -->
    <DayDetailModal 
        v-model="showDayModal" 
        :day-data="selectedDayData"
        @refresh="loadCalendarData" 
    />
  </div>
</template>

<script setup lang="ts">
import DayDetailModal from '~/components/calendar/DayDetailModal.vue'

definePageMeta({
    layout: 'default'
})

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const currentDate = ref(new Date())
const calendarData = ref<any>({ days: [], summary: {} })
const showDayModal = ref(false)
const selectedDayData = ref<any>(null)

const currentMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${month}月`
})

const summary = computed(() => calendarData.value.summary || { totalTasks: 0, completedTasks: 0, totalIncome: 0, checkinDays: 0 })

interface CalendarDay {
  date: number
  fullDate: string
  isCurrentMonth: boolean
  isToday: boolean
  data: any
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()
  
  const days: CalendarDay[] = []
  const dataMap: Record<string, any> = {}
  
  // Build data map from API response
  calendarData.value.days?.forEach((d: any) => {
    dataMap[d.date] = d
  })
  
  // Previous month days
  const startDayOfWeek = firstDay.getDay()
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    const prevMonth = month === 0 ? 12 : month
    const prevYear = month === 0 ? year - 1 : year
    const fullDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      date: d,
      fullDate,
      isCurrentMonth: false,
      isToday: false,
      data: dataMap[fullDate] || null
    })
  }
  
  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const isToday = today.getFullYear() === year && 
                    today.getMonth() === month && 
                    today.getDate() === d
    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      date: d,
      fullDate,
      isCurrentMonth: true,
      isToday,
      data: dataMap[fullDate] || null
    })
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - days.length // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const nextMonth = month === 11 ? 1 : month + 2
    const nextYear = month === 11 ? year + 1 : year
    const fullDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      date: i,
      fullDate,
      isCurrentMonth: false,
      isToday: false,
      data: dataMap[fullDate] || null
    })
  }
  
  return days
})

async function loadCalendarData() {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth() + 1
    try {
        const data = await $fetch(`/api/calendar?year=${year}&month=${month}`)
        calendarData.value = data
    } catch (e) {
        console.error('Failed to load calendar data', e)
    }
}

function prevMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
  loadCalendarData()
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
  loadCalendarData()
}

function goToToday() {
    currentDate.value = new Date()
    loadCalendarData()
}

function openDayDetail(day: CalendarDay) {
    if (!day.isCurrentMonth) return
    selectedDayData.value = day.data || { date: day.fullDate, tasks: [], income: [], checkedIn: false }
    showDayModal.value = true
}

onMounted(() => {
    loadCalendarData()
})
</script>

<style scoped>
.shadow-hard-sm {
    box-shadow: 4px 4px 0px 0px #000;
}
</style>

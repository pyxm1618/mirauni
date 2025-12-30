<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <h1 class="text-3xl md:text-5xl font-black mb-1">日历视图</h1>
        <p class="text-gray-500 font-medium">查看你的任务安排和进度</p>
      </div>
      <div class="flex gap-2">
        <UButton variant="outline" color="gray" icon="i-lucide-chevron-left" @click="prevMonth" />
        <UButton variant="outline" color="gray" class="min-w-32">{{ currentMonth }}</UButton>
        <UButton variant="outline" color="gray" icon="i-lucide-chevron-right" @click="nextMonth" />
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
          class="min-h-24 p-2 border-r border-b border-gray-200 last:border-r-0"
          :class="{
            'bg-gray-50': !day.isCurrentMonth,
            'bg-toon-50': day.isToday
          }"
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
            <span v-if="day.taskCount > 0" class="text-xs font-bold text-toon-600">
              {{ day.taskCount }}个任务
            </span>
          </div>
          <!-- Task Preview -->
          <div v-if="day.tasks.length > 0" class="mt-1 space-y-1">
            <div 
              v-for="task in day.tasks.slice(0, 2)" 
              :key="task.id"
              class="text-xs truncate px-1 py-0.5 rounded"
              :class="task.status === 'done' ? 'bg-green-100 text-green-700 line-through' : 'bg-toon-100 text-toon-700'"
            >
              {{ task.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Coming Soon Notice -->
    <div class="bg-yellow-50 border-3 border-yellow-400 rounded-xl p-6 text-center">
      <p class="font-bold text-yellow-700">
        日历功能正在开发中，敬请期待
      </p>
      <p class="text-sm text-yellow-600 mt-1">
        即将支持：拖拽任务、为任务设置截止日期等功能
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    // Auth is handled globally by auth.global.ts
})

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const currentDate = ref(new Date())

const currentMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${month}月`
})

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  tasks: any[]
  taskCount: number
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()
  
  const days: CalendarDay[] = []
  
  // Previous month days
  const startDayOfWeek = firstDay.getDay()
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false,
      tasks: [],
      taskCount: 0
    })
  }
  
  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const isToday = today.getFullYear() === year && 
                    today.getMonth() === month && 
                    today.getDate() === d
    days.push({
      date: d,
      isCurrentMonth: true,
      isToday,
      tasks: [], // TODO: populate from API
      taskCount: 0
    })
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - days.length // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      isCurrentMonth: false,
      isToday: false,
      tasks: [],
      taskCount: 0
    })
  }
  
  return days
})

function prevMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}
</script>

<template>
  <div class="space-y-8">
    <div class="text-center mb-8">
      <h2 class="text-2xl md:text-3xl font-black">你是谁？时间怎么用？</h2>
      <p class="text-gray-500 font-medium">帮助系统为你安排合理的每日任务</p>
    </div>

    <!-- 1. Background -->
    <div class="space-y-4">
      <h3 class="font-bold text-lg flex items-center gap-2">
        <span class="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
        你的职业/技能背景是？
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <OptionCard 
          v-for="bg in backgrounds" :key="bg.value"
          :value="bg.value"
          v-model="form.background"
          :label="bg.label"
          :multiple="true" 
        />
      </div>
    </div>

    <!-- 2. Weekly Hours -->
    <div class="space-y-4">
      <h3 class="font-bold text-lg flex items-center gap-2">
        <span class="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
        每周能投入多少小时？
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <OptionCard 
          v-for="t in times" :key="t.value"
          :value="t.value"
          v-model="form.weeklyHours"
          :label="t.label"
        />
      </div>
    </div>

    <!-- 3. Work Days (NEW) -->
    <div class="space-y-4">
      <h3 class="font-bold text-lg flex items-center gap-2">
        <span class="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
        哪几天可以安排任务？
      </h3>
      <div class="flex flex-wrap gap-3">
        <button 
          v-for="day in weekDays" 
          :key="day.value"
          @click="toggleDay(day.value)"
          :class="[
            'px-4 py-2 rounded-xl border-2 font-bold transition-all',
            form.workDays.includes(day.value) 
              ? 'bg-black text-white border-black' 
              : 'bg-white text-gray-600 border-gray-200 hover:border-black'
          ]"
        >
          {{ day.label }}
        </button>
      </div>
      <p class="text-xs text-gray-400">至少选择1天，选中的日期会被分配任务</p>
    </div>

    <!-- 4. Constraints (Optional) -->
    <div class="space-y-4">
      <h3 class="font-bold text-lg flex items-center gap-2">
        <span class="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
        你不愿意做的事？<span class="text-gray-400 font-normal text-sm">(可选)</span>
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          v-for="c in constraintOptions" 
          :key="c.value"
          @click="toggleConstraint(c.value)"
          :class="[
            'px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all text-left',
            form.constraints.includes(c.value) 
              ? 'bg-red-50 text-red-700 border-red-300' 
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          ]"
        >
          {{ c.label }}
        </button>
      </div>
    </div>

    <div class="flex justify-between pt-8">
       <UButton
        @click="back"
        variant="ghost"
        color="gray"
        class="px-8"
      >
        上一步
      </UButton>
      <UButton
        @click="next"
        :disabled="!isValid"
        :loading="saving"
        size="xl"
        class="px-12 font-bold"
        color="black"
      >
        下一步
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import OptionCard from '~/components/wizard/OptionCard.vue'
import { useWizardStore } from '~/stores/wizard'

definePageMeta({
    layout: 'blank'
})

const store = useWizardStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  background: Array.isArray(store.profile.background) ? store.profile.background : [], // Ensure array
  weeklyHours: store.profile.weeklyHours || 20,
  workDays: store.profile.workDays || [1, 2, 3, 4, 5], // Mon-Fri default
  constraints: [...(store.profile.constraints || [])]
})

const backgrounds = [
  { label: '技术/开发', value: 'tech' },
  { label: '设计', value: 'design' },
  { label: '运营/营销', value: 'marketing' },
  { label: '内容创作', value: 'content' },
  { label: '销售', value: 'sales' },
  { label: '传统行业', value: 'traditional' },
  { label: '其他', value: 'other' }
]

const times = [
  { label: '< 10h', value: 10 },
  { label: '10-20h', value: 15 },
  { label: '20-40h', value: 30 },
  { label: '全职 40h+', value: 40 }
]

const weekDays = [
  { label: '周日', value: 0 },
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 }
]

const constraintOptions = [
  { label: '不愿露脸', value: 'no_face' },
  { label: '不愿频繁社交', value: 'no_social' },
  { label: '不愿前期投钱', value: 'no_upfront_cost' },
  { label: '不能长期无收入', value: 'no_long_wait' }
]

const isValid = computed(() => form.background.length > 0 && form.weeklyHours > 0 && form.workDays.length > 0)
const saving = ref(false)

function toggleDay(day: number) {
  const idx = form.workDays.indexOf(day)
  if (idx >= 0) {
    if (form.workDays.length > 1) { // 至少保留1天
      form.workDays.splice(idx, 1)
    }
  } else {
    form.workDays.push(day)
  }
}

function toggleConstraint(c: string) {
  const idx = form.constraints.indexOf(c)
  if (idx >= 0) {
    form.constraints.splice(idx, 1)
  }
  else {
    form.constraints.push(c)
  }
}

async function next() {
  if (!isValid.value) return
  
  saving.value = true
  try {
    // Save to user_profiles table
    // Convert background array to string for DB if needed, or update DB schema. 
    // For now, assuming DB 'background' column is TEXT, we join them or store as JSON if we could.
    // Given the previous schema 'background TEXT', we'll join with commas.
    await $fetch('/api/profile', {
      method: 'POST',
      body: {
        weekly_hours: form.weeklyHours,
        work_days: form.workDays,
        background: form.background.join(','), // Simple CSV for text column
        constraints: form.constraints
      }
    })
    
    // Also update store
    store.updateProfile({
      background: form.background,
      weeklyHours: form.weeklyHours,
      workDays: form.workDays,
      constraints: form.constraints
    })
    
    store.currentStep = 3
    router.push('/wizard/paths')
  } catch (e: any) {
    toast.add({ title: '保存失败', description: e.message, color: 'red' })
  } finally {
    saving.value = false
  }
}

function back() {
    // 返回着陆页（目标金额输入页）
    router.push('/')
}

onMounted(() => {
    store.currentStep = 2
})
</script>

<template>
  <div class="space-y-8">
    <div class="text-center mb-8">
      <h2 class="text-2xl md:text-3xl font-black">你是谁？时间多吗？</h2>
      <p class="text-gray-500 font-medium">帮助 AI 为你匹配最合适的可行路径</p>
    </div>

    <!-- 1. Background -->
    <div class="space-y-4">
      <h3 class="font-bold text-lg flex items-center gap-2">
        <span class="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
        你的职业/技能背景是？
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <OptionCard 
          v-for="bg in backgrounds" :key="bg"
          :value="bg"
          v-model="form.background"
          :label="bg"
        />
      </div>
    </div>

    <!-- 2. Time -->
    <div class="space-y-4">
      <h3 class="font-bold text-lg flex items-center gap-2">
        <span class="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
        每周能投入多少时间？
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

const store = useWizardStore()
const router = useRouter()

const form = reactive({
  background: store.profile.background,
  weeklyHours: store.profile.weeklyHours,
  constraints: [...store.profile.constraints]
})

const backgrounds = ['技术/开发', '设计', '运营/营销', '内容创作', '销售', '传统行业', '其他']
const times = [
  { label: '< 10h', value: '<10h' },
  { label: '10-20h', value: '10-20h' },
  { label: '20-40h', value: '20-40h' },
  { label: '全职', value: '40h+' }
]
const constraintOptions = ['露脸 (视频/直播)', '频繁社交', '前期投钱', '长期无收入 (6个月+)']

const isValid = computed(() => !!form.background && !!form.weeklyHours)

function next() {
  if (!isValid.value) return
  store.updateProfile(form)
  store.currentStep = 3
  router.push('/wizard/idea')
}

function back() {
    store.currentStep = 1
    router.push('/wizard')
}

onMounted(() => {
    store.currentStep = 2
})
</script>

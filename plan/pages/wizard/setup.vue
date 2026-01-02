<template>
  <div class="space-y-8 max-w-3xl mx-auto pb-20">
    <div class="text-center space-y-4">
      <h2 class="text-3xl font-black">收入公式推演</h2>
      <p class="text-gray-500 font-medium">
        为了达到 <span class="text-black font-black">{{ formatIncome(store.incomeGoal || 0) }}万</span> 的目标，我们需要拆解每条路径的盈利模式。
      </p>
    </div>

    <!-- Summary Dashboard -->
    <div class="sticky top-4 z-10 bg-black text-white p-4 rounded-xl shadow-2xl flex justify-between items-center transition-all">
      <div>
        <div class="text-xs text-gray-400 uppercase tracking-wider">当前推演总额</div>
        <div class="text-2xl font-mono font-bold" :class="isGoalMet ? 'text-green-400' : 'text-yellow-400'">
          ¥ {{ formatNumber(totalCalculated) }}
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs text-gray-400 uppercase tracking-wider">目标进度</div>
        <div class="text-lg font-bold">
          {{ progressPercentage }}%
        </div>
      </div>
      <!-- Progress Bar Background -->
      <div class="absolute bottom-0 left-0 h-1 bg-gray-800 w-full rounded-b-xl overflow-hidden">
        <div class="h-full bg-green-500 transition-all duration-500" :style="{ width: `${Math.min(progressPercentage, 100)}%` }"></div>
      </div>
    </div>

    <!-- Path Config Cards -->
    <div class="space-y-6">
      <div v-for="(path, idx) in store.paths" :key="path.id" class="bg-white border-3 border-black rounded-2xl overflow-hidden shadow-hard">
        <!-- Header -->
        <div class="bg-gray-50 p-4 border-b-2 border-gray-100 flex justify-between items-center">
          <div class="flex items-center gap-3">
             <span class="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{{ idx + 1 }}</span>
             <h3 class="font-black text-lg">{{ path.name }}</h3>
          </div>
          <div class="text-sm font-bold text-gray-500">
            权重: {{ path.weight }}%
          </div>
        </div>

        <!-- Formula Body -->
        <div class="p-6 space-y-6">
          
          <!-- Product / SaaS Formula -->
          <div v-if="path.type === 'product'" class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
             <div class="space-y-1">
               <label class="text-xs font-bold text-gray-500 uppercase">预计年销量 (单)</label>
               <input v-model.number="path.formula.config.units" type="number" class="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl font-mono font-bold py-1" placeholder="1000" />
             </div>
             <div class="flex items-center justify-center pb-2 text-gray-400 font-bold">×</div>
             <div class="space-y-1">
               <label class="text-xs font-bold text-gray-500 uppercase">客单价 (元)</label>
               <input v-model.number="path.formula.config.price" type="number" class="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl font-mono font-bold py-1" placeholder="249" />
             </div>
          </div>

          <!-- Content / Ads Formula -->
          <div v-else-if="path.type === 'content'" class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
             <div class="space-y-1">
               <label class="text-xs font-bold text-gray-500 uppercase">年接单/广告数</label>
               <input v-model.number="path.formula.config.units" type="number" class="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl font-mono font-bold py-1" placeholder="50" />
             </div>
             <div class="flex items-center justify-center pb-2 text-gray-400 font-bold">×</div>
             <div class="space-y-1">
               <label class="text-xs font-bold text-gray-500 uppercase">平均单价 (元)</label>
               <input v-model.number="path.formula.config.price" type="number" class="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl font-mono font-bold py-1" placeholder="500" />
             </div>
          </div>

          <!-- Service / Hourly Formula -->
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
             <div class="space-y-1">
               <label class="text-xs font-bold text-gray-500 uppercase">年计费小时/项目</label>
               <input v-model.number="path.formula.config.units" type="number" class="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl font-mono font-bold py-1" placeholder="100" />
             </div>
             <div class="flex items-center justify-center pb-2 text-gray-400 font-bold">×</div>
             <div class="space-y-1">
               <label class="text-xs font-bold text-gray-500 uppercase">时薪/单价 (元)</label>
               <input v-model.number="path.formula.config.price" type="number" class="w-full border-b-2 border-gray-300 focus:border-black outline-none text-xl font-mono font-bold py-1" placeholder="300" />
             </div>
          </div>

          <!-- Result Row -->
          <div class="flex justify-between items-center pt-4 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 py-4 mt-4">
             <span class="text-sm font-bold text-gray-500">预计贡献:</span>
             <span class="text-xl font-mono font-black">¥ {{ formatNumber(calculatePathIncome(path)) }}</span>
          </div>

        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between pt-8 border-t-2 border-gray-100">
       <UButton @click="router.back()" variant="ghost" color="gray">上一步</UButton>
       
       <div class="flex gap-4">
          <UButton 
            v-if="!isGoalMet"
            variant="ghost" 
            color="orange"
            class="text-sm"
          >
            还差 {{ formatNumber((store.incomeGoal || 0)*10000 - totalCalculated) }} 元
          </UButton>

          <UButton 
            @click="next" 
            size="xl" 
            color="black" 
            class="px-12 font-bold"
            :loading="generating"
          >
            生成里程碑规划
            <UIcon name="i-lucide-arrow-right" />
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
const generating = ref(false)

// Init configs if empty
store.paths.forEach(p => {
  if (!p.formula.config.units) p.formula.config.units = 0
  if (!p.formula.config.price) p.formula.config.price = 0
})

const calculatePathIncome = (path: any) => {
  const income = (path.formula.config.units || 0) * (path.formula.config.price || 0)
  path.formula.calculatedIncome = income // Update store state implicitly
  return income
}

const totalCalculated = computed(() => {
  return store.paths.reduce((sum, p) => sum + calculatePathIncome(p), 0)
})

const progressPercentage = computed(() => {
  const goal = (store.incomeGoal || 0) * 10000 // Convert Wan to Yuan
  if (goal === 0) return 0
  return Math.round((totalCalculated.value / goal) * 100)
})

const isGoalMet = computed(() => {
   return progressPercentage.value >= 100
})

function formatIncome(wan: number) {
  return wan
}

function formatNumber(num: number) {
  return num.toLocaleString()
}

async function next() {
  generating.value = true
  try {
    // Call API to generate Milestones (L3)
    // For now, we mock or skip to timeline
    // In next task, we will implement the API call
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    router.push('/wizard/timeline')
  } catch (e) {
    console.error(e)
  } finally {
    generating.value = false
  }
}
</script>
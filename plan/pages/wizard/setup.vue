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
      <div v-for="(path, idx) in store.paths" :key="path.id" class="bg-white border-3 border-black rounded-2xl overflow-hidden shadow-hard transition-all hover:shadow-hard-lg">
        <!-- Header -->
        <div class="bg-gray-50 p-4 border-b-2 border-gray-100 flex justify-between items-center">
          <div class="flex items-center gap-3">
             <span class="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{{ idx + 1 }}</span>
             <h3 class="font-black text-lg">{{ path.name }}</h3>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-xs font-bold text-gray-400">目标贡献 ({{ path.weight }}%)</span>
            <span class="font-mono font-bold text-gray-600">¥ {{ formatNumber((store.incomeGoal || 0) * 10000 * (path.weight / 100)) }}</span>
          </div>
        </div>

        <!-- Formula Body -->
        <div class="p-6 space-y-6">
          
          <!-- Step 1: 定价档位选择 -->
          <div class="space-y-3">
            <label class="text-sm font-bold text-gray-600">你打算怎么定价？</label>
            <div class="grid grid-cols-3 gap-3">
              <button 
                v-for="tier in getPricingTiers(path.type)" 
                :key="tier.id"
                @click="selectPricingTier(path, tier)"
                :class="[
                  'p-4 rounded-xl border-2 text-center transition-all',
                  path.formula.config.selectedTier === tier.id 
                    ? 'border-black bg-yellow-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-400'
                ]"
              >
                <div class="font-black text-lg">{{ tier.label }}</div>
                <div class="text-sm text-gray-500">{{ tier.priceRange }}</div>
                <div class="text-xs text-gray-400 mt-1">{{ tier.desc }}</div>
              </button>
            </div>
          </div>

          <!-- Step 2: 反向推算结果展示 -->
          <div v-if="path.formula.config.selectedTier" class="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
            <div class="text-sm text-gray-500 mb-3">
              基于你选的「{{ getSelectedTierLabel(path) }}」定价 ¥{{ path.formula.config.price }}/{{ getUnitLabel(path.type) }}
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-gray-400 uppercase">达成目标需要</div>
                <div class="text-3xl font-black text-black">
                  {{ path.formula.config.units }} <span class="text-lg font-bold text-gray-500">{{ getUnitsLabel(path.type) }}</span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-400 uppercase">平均每月</div>
                <div class="text-xl font-bold text-gray-700">
                  {{ Math.ceil(path.formula.config.units / 12) }} {{ getUnitsLabel(path.type) }}
                </div>
              </div>
            </div>

            <!-- 转化率提示 (仅产品类) -->
            <div v-if="path.type === 'product'" class="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              💡 按3%转化率，每月需触达约 <span class="font-bold">{{ Math.ceil(path.formula.config.units / 12 / 0.03) }}</span> 位访客
            </div>
          </div>

          <!-- Step 3: 高级微调 (折叠) -->
          <details class="group">
            <summary class="cursor-pointer text-sm font-bold text-gray-500 flex items-center gap-2 hover:text-black">
              <UIcon name="i-lucide-settings-2" class="w-4 h-4" />
              自定义参数
              <UIcon name="i-lucide-chevron-down" class="w-4 h-4 transition-transform group-open:rotate-180" />
            </summary>
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase">{{ path.type === 'product' ? '客单价' : '单价' }} (元)</label>
                <input 
                  v-model.number="path.formula.config.price" 
                  type="number" 
                  @change="recalculateUnits(path)"
                  class="w-full bg-white border-2 border-gray-200 rounded-lg p-2 font-mono font-bold focus:border-black outline-none no-spinner" 
                />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase">{{ path.type === 'product' ? '年销量' : '年数量' }}</label>
                <input 
                  v-model.number="path.formula.config.units" 
                  type="number" 
                  class="w-full bg-white border-2 border-gray-200 rounded-lg p-2 font-mono font-bold focus:border-black outline-none no-spinner" 
                />
              </div>
            </div>
            
            <!-- 参考锚点 -->
            <div v-if="getReferences(path.type).length" class="mt-4 p-3 bg-blue-50 rounded-lg">
              <div class="text-xs font-bold text-blue-600 mb-2">💡 同类产品参考定价</div>
              <div class="flex flex-wrap gap-2">
                <span v-for="ref in getReferences(path.type)" :key="ref.name" class="text-xs bg-white px-2 py-1 rounded border border-blue-200">
                  {{ ref.name }}: ¥{{ ref.price }}
                </span>
              </div>
            </div>
          </details>

          <!-- Result Row -->
          <div class="flex justify-between items-center pt-4 border-t border-gray-100">
             <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-gray-500">预计年收入:</span>
                <span 
                    class="text-2xl font-mono font-black"
                    :class="calculatePathIncome(path) >= getPathTarget(path) ? 'text-green-600' : 'text-gray-900'"
                >
                    ¥ {{ formatNumber(calculatePathIncome(path)) }}
                </span>
             </div>
             <div class="text-xs font-bold">
                <span v-if="calculatePathIncome(path) < getPathTarget(path)" class="text-red-500 bg-red-50 px-2 py-1 rounded">
                   还差 {{ formatNumber(getPathTarget(path) - calculatePathIncome(path)) }}
                </span>
                <span v-else class="text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                   <UIcon name="i-lucide-check" /> 达标
                </span>
             </div>
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

// 定价档位配置
const pricingTiers: Record<string, any[]> = {
  product: [
    { id: 'low', label: '低价走量', priceRange: '¥49-99', desc: '需要更多用户', price: 79 },
    { id: 'mid', label: '中端定价', priceRange: '¥199-499', desc: '平衡型', price: 299 },
    { id: 'high', label: '高端精品', priceRange: '¥999+', desc: '更少但精准', price: 999 }
  ],
  content: [
    { id: 'low', label: '入门接单', priceRange: '¥200-500', desc: '快速积累', price: 300 },
    { id: 'mid', label: '专业报价', priceRange: '¥1000-3000', desc: '质量优先', price: 2000 },
    { id: 'high', label: '高端定制', priceRange: '¥5000+', desc: '精品路线', price: 5000 }
  ],
  service: [
    { id: 'low', label: '时薪入门', priceRange: '¥100-200/h', desc: '积累客户', price: 150 },
    { id: 'mid', label: '专业时薪', priceRange: '¥300-500/h', desc: '市场均价', price: 400 },
    { id: 'high', label: '专家定价', priceRange: '¥800+/h', desc: '高端市场', price: 800 }
  ]
}

// 参考锚点
const references: Record<string, any[]> = {
  product: [
    { name: 'Notion', price: '96/月' },
    { name: 'Figma', price: '144/月' },
    { name: 'Canva Pro', price: '99/月' }
  ],
  content: [
    { name: '公众号广告', price: '500-2000/条' },
    { name: '小红书推广', price: '300-1500/篇' }
  ],
  service: [
    { name: '技术咨询', price: '300-800/h' },
    { name: '设计外包', price: '200-500/h' }
  ]
}

// Init configs
store.paths.forEach(p => {
  if (!p.formula.config.units) p.formula.config.units = 0
  if (!p.formula.config.price) p.formula.config.price = 0
  if (!p.formula.config.selectedTier) p.formula.config.selectedTier = ''
})

// 获取路径目标金额
function getPathTarget(path: any) {
  return (store.incomeGoal || 0) * 10000 * (path.weight / 100)
}

// 获取定价档位
function getPricingTiers(type: string) {
  return pricingTiers[type] || pricingTiers.service
}

// 选择定价档位并反向推算
function selectPricingTier(path: any, tier: any) {
  path.formula.config.selectedTier = tier.id
  path.formula.config.price = tier.price
  recalculateUnits(path)
}

// 反向推算需要的销量
function recalculateUnits(path: any) {
  const target = getPathTarget(path)
  if (path.formula.config.price > 0) {
    path.formula.config.units = Math.ceil(target / path.formula.config.price)
  }
}

// 获取选中档位的标签
function getSelectedTierLabel(path: any) {
  const tiers = getPricingTiers(path.type)
  const tier = tiers.find((t: any) => t.id === path.formula.config.selectedTier)
  return tier?.label || ''
}

// 获取单位标签
function getUnitLabel(type: string) {
  if (type === 'product') return '单'
  if (type === 'content') return '篇/次'
  return '小时'
}

function getUnitsLabel(type: string) {
  if (type === 'product') return '单/年'
  if (type === 'content') return '篇/年'
  return '小时/年'
}

// 获取参考锚点
function getReferences(type: string) {
  return references[type] || []
}

const calculatePathIncome = (path: any) => {
  const income = (path.formula.config.units || 0) * (path.formula.config.price || 0)
  path.formula.calculatedIncome = income
  return income
}

const totalCalculated = computed(() => {
  return store.paths.reduce((sum, p) => sum + calculatePathIncome(p), 0)
})

const progressPercentage = computed(() => {
  const goal = (store.incomeGoal || 0) * 10000
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
    await new Promise(resolve => setTimeout(resolve, 800))
    router.push('/wizard/timeline')
  } catch (e) {
    console.error(e)
  } finally {
    generating.value = false
  }
}
</script>
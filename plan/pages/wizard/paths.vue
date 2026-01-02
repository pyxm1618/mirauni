<template>
  <div class="space-y-8 max-w-2xl mx-auto pb-20">
    <div class="text-center space-y-4">
      <h2 class="text-3xl font-black">为你推荐的路径</h2>
      <p class="text-gray-500 font-medium">基于你的背景，我们推荐以下赚钱模式。你可以多选组合。</p>
    </div>

    <!-- 1. Daily Hours Input -->
    <div class="bg-white p-6 rounded-2xl border-3 border-black shadow-hard space-y-4">
      <label class="block font-black text-lg">你每天能投入多少专注时间？</label>
      <div class="flex items-center gap-4">
        <input 
          v-model.number="dailyHours" 
          type="number" 
          min="1" 
          max="24"
          class="w-24 text-center text-3xl font-black border-b-4 border-black bg-transparent focus:outline-none py-2"
        />
        <span class="text-xl font-bold text-gray-400">小时/天</span>
      </div>
      <p class="text-sm text-gray-500">建议从每天 2-4 小时开始，保持可持续性。</p>
    </div>

    <!-- 2. Path Selection & Weight Allocation -->
    <div class="space-y-4">
      <h3 class="font-black text-xl flex justify-between items-center">
          <span>路径组合</span>
          <button @click="openCustomModal" class="text-sm font-bold text-gray-500 hover:text-black flex items-center gap-1">
              <UIcon name="i-lucide-plus" /> 自定义路径
          </button>
      </h3>
      
      <div v-for="path in displayedPaths" :key="path.id" 
        @click="toggleSelection(path)"
        class="bg-white p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none"
        :class="path.selected ? 'border-black shadow-md bg-yellow-50' : 'border-gray-200 opacity-80 hover:opacity-100 hover:border-gray-300'"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <!-- Checkbox visual only (pointer-events-none) or handle logic carefully -->
            <div class="relative flex items-center">
               <div class="w-5 h-5 border-2 rounded flex items-center justify-center transition-colors" 
                   :class="path.selected ? 'bg-black border-black' : 'border-gray-300 bg-white'">
                   <UIcon v-if="path.selected" name="i-lucide-check" class="text-white w-3.5 h-3.5" />
               </div>
            </div>
            
            <span class="font-bold text-lg">{{ path.name }}</span>
            <span v-if="path.isCustom" class="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">自定义</span>
          </div>
          <div v-if="path.selected" class="flex items-center gap-2">
            <span class="font-mono font-bold">{{ calculateHours(path.weight) }}h</span>
            <span class="text-xs text-gray-500">({{ path.weight }}%)</span>
          </div>
        </div>

        <!-- Weight Slider (Only visible if selected) -->
        <!-- @click.stop to prevent toggling when dragging slider -->
        <div v-if="path.selected" class="pl-8 pr-2 pt-2" @click.stop>
          <input 
            type="range" 
            v-model.number="path.weight" 
            min="0" 
            max="100" 
            step="5"
            class="w-full accent-black cursor-pointer"
          />
        </div>
      </div>
      
      <div v-if="displayedPaths.length === 0" class="text-center py-8 text-gray-400">
          没有找到推荐路径，请尝试添加自定义路径。
      </div>
    </div>

    <!-- Total Weight Check -->
    <div class="flex flex-col bg-gray-100 p-4 rounded-xl sticky bottom-4 z-20 shadow-lg border-2 border-black">
      <div class="flex justify-between items-center">
        <span class="font-bold text-gray-600">精力分配状态</span>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-black" :class="totalWeight <= 100 ? 'text-black' : 'text-red-500'">
            {{ totalWeight }}%
          </span>
          <UIcon v-if="totalWeight <= 100" name="i-lucide-check-circle" class="text-green-600 w-6 h-6" />
          <UIcon v-else name="i-lucide-alert-triangle" class="text-red-500 w-6 h-6" />
        </div>
      </div>
      
      <!-- Feedback Text -->
      <div class="text-xs font-bold mt-1">
        <p v-if="totalWeight < 100 && totalWeight > 0" class="text-orange-600">
          ⚠️ 剩余 {{ 100 - totalWeight }}% 将作为每日弹性缓冲时间。
        </p>
        <p v-else-if="totalWeight > 100" class="text-red-500">
          ❌ 已超过 100%！请减少权重或增加“专注时间”。
        </p>
        <p v-else-if="totalWeight === 100" class="text-green-600">
          ✅ 精力已完全分配，计划非常紧凑。
        </p>
      </div>
    </div>

    <div class="flex justify-between pt-6">
       <UButton @click="back" variant="ghost" color="gray">上一步</UButton>
       <UButton 
        @click="next" 
        size="xl" 
        color="black" 
        class="px-12 font-bold"
        :disabled="totalWeight > 100 || totalWeight === 0"
      >
        下一步：配置收入公式
      </UButton>
    </div>

    <!-- Custom Path Modal -->
    <UModal v-model="showCustomModal">
        <div class="p-6 space-y-4">
            <h3 class="text-xl font-black">添加自定义路径</h3>
            <div>
                <label class="block text-sm font-bold mb-1">路径名称</label>
                <input v-model="customForm.name" class="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-black outline-none" placeholder="例如：闲鱼副业" autofocus />
            </div>
            <div>
                <label class="block text-sm font-bold mb-1">类型 (用于计算公式)</label>
                <select v-model="customForm.type" class="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-black outline-none">
                    <option value="product">产品型 (销量 × 单价)</option>
                    <option value="service">服务型 (时长 × 单价)</option>
                    <option value="content">内容型 (数量 × 单价)</option>
                    <option value="other">其他 (直接输入总额)</option>
                </select>
            </div>
            <div class="flex gap-4 pt-4">
                <UButton block variant="ghost" color="gray" @click="showCustomModal = false">取消</UButton>
                <UButton block color="black" @click="addCustomPath" :disabled="!customForm.name">添加</UButton>
            </div>
        </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore, type Path } from '~/stores/wizard'

definePageMeta({
    layout: 'blank'
})

const store = useWizardStore()
const router = useRouter()

// --- State ---
const dailyHours = ref(store.profile.weeklyHours ? Math.round(store.profile.weeklyHours / 5) : 4)
const displayedPaths = ref<any[]>([])
const showCustomModal = ref(false)
const customForm = reactive({ name: '', type: 'other' })

// --- Recommendation Logic ---
// Dictionary: Background Key -> Recommended Path IDs
// We define a pool of standard paths first
const standardPool = [
    { id: 'saas', name: '独立开发 (SaaS产品)', type: 'product' },
    { id: 'dev_service', name: '技术外包/咨询', type: 'service' },
    { id: 'tech_blog', name: '技术博客/专栏', type: 'content' },
    { id: 'design_assets', name: '设计素材/模板销售', type: 'product' },
    { id: 'design_service', name: '设计接单', type: 'service' },
    { id: 'marketing_affiliate', name: '联盟营销/带货', type: 'content' },
    { id: 'community', name: '付费社群运营', type: 'service' },
    { id: 'content_creator', name: '自媒体/短视频', type: 'content' },
    { id: 'course', name: '售卖课程/数字资源', type: 'product' },
    { id: 'sales_agency', name: '代理销售/中介', type: 'service' },
    { id: 'ecommerce', name: '电商/跨境', type: 'product' },
    { id: 'freelance', name: '自由职业/零工', type: 'service' }
]

const recommendations: Record<string, string[]> = {
    'tech': ['saas', 'tech_blog', 'dev_service'],
    'design': ['design_assets', 'design_service', 'content_creator'],
    'marketing': ['marketing_affiliate', 'community', 'course'],
    'content': ['content_creator', 'tech_blog', 'course'],
    'sales': ['sales_agency', 'community'],
    'traditional': ['ecommerce', 'freelance'],
    'other': ['freelance', 'content_creator']
}

// --- Init Logic ---
onMounted(() => {
    // 1. Determine recommended IDs based on profile
    const backgrounds = Array.isArray(store.profile.background) ? store.profile.background : [store.profile.background || 'other']
    const recommendedIds = new Set<string>()
    
    backgrounds.forEach(bg => {
        const recs = recommendations[bg] || recommendations['other']
        recs.forEach(id => recommendedIds.add(id))
    })

    // 2. Build the list
    // Priority: Existing Store Paths > Recommendations
    // We want to KEEP existing selections (and their weights) if user comes back
    
    // Convert pool to map for easy lookup
    const poolMap = new Map(standardPool.map(p => [p.id, p]))
    
    // Existing paths in store (could be standard or custom)
    const existingMap = new Map(store.paths.map(p => [p.id, p]))

    // Merge: 
    // Start with Recommended
    const mergedList: any[] = []
    
    // Add all recommended ones
    recommendedIds.forEach(id => {
        const poolItem = poolMap.get(id)
        if (poolItem) {
            // Check if it exists in store to preserve state (selected, weight)
            const existing = existingMap.get(id)
            if (existing) {
                mergedList.push({ ...poolItem, selected: true, weight: existing.weight, formula: existing.formula })
                existingMap.delete(id) // Mark as handled
            } else {
                mergedList.push({ ...poolItem, selected: false, weight: 0 })
            }
        }
    })

    // Add remaining from store (these are Custom paths OR standard paths that were selected but maybe recommendation logic changed or user manually added if we had that feature)
    // In this context, it mainly handles "Custom Paths" added by user previously, OR standard paths that persisted.
    existingMap.forEach((p, id) => {
        mergedList.push({ 
            id: p.id, 
            name: p.name, 
            type: p.type, 
            selected: true, 
            weight: p.weight, 
            formula: p.formula,
            isCustom: !poolMap.has(id) // Mark as custom if not in standard pool
        })
    })

    displayedPaths.value = mergedList
})


// --- Computed ---
const selectedCount = computed(() => displayedPaths.value.filter(p => p.selected).length)
const totalWeight = computed(() => displayedPaths.value.filter(p => p.selected).reduce((sum, p) => sum + p.weight, 0))

function calculateHours(weight: number) {
  return ((dailyHours.value * weight) / 100).toFixed(1)
}

function toggleSelection(path: any) {
  path.selected = !path.selected
  if (path.selected) {
    // Only auto-rebalance if it's a new selection to help user
    rebalanceWeights()
  } else {
    path.weight = 0
  }
}

function rebalanceWeights() {
  const selected = displayedPaths.value.filter(p => p.selected)
  const count = selected.length
  if (count === 0) return

  const avg = Math.floor(100 / count)
  const remainder = 100 % count
  
  selected.forEach((p, index) => {
    p.weight = avg + (index < remainder ? 1 : 0)
  })
  
  // Reset unselected
  displayedPaths.value.filter(p => !p.selected).forEach(p => p.weight = 0)
}

function openCustomModal() {
    customForm.name = ''
    customForm.type = 'other'
    showCustomModal.value = true
}

function addCustomPath() {
    if (!customForm.name) return
    
    const newPath = {
        id: `custom-${Date.now()}`,
        name: customForm.name,
        type: customForm.type,
        selected: true,
        weight: 0,
        isCustom: true
    }
    
    displayedPaths.value.push(newPath)
    rebalanceWeights() // Auto select and rebalance
    showCustomModal.value = false
}

function back() {
  router.back()
}

function next() {
  if (totalWeight.value !== 100) return

  // Save to store
  const selectedPaths: Path[] = displayedPaths.value
    .filter(p => p.selected)
    .map(p => ({
      id: p.id,
      name: p.name,
      type: p.type as any,
      weight: p.weight,
      dailyHours: Number(calculateHours(p.weight)),
      formula: p.formula || { type: 'default', config: {}, calculatedIncome: 0 },
      durationWeeks: 12, 
      startDate: new Date().toISOString().split('T')[0]
    }))

  store.setPaths(selectedPaths)
  store.updateProfile({ weeklyHours: dailyHours.value * 5 }) 

  router.push('/wizard/setup')
}
</script>
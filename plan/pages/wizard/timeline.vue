<template>
  <div class="space-y-8 pb-20">
    <div class="text-center space-y-4">
      <h2 class="text-3xl font-black">里程碑规划 (L3)</h2>
      <p class="text-gray-500 font-medium">这是实现目标的战略骨架。AI 已为你规划了关键节点。</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-20 text-center space-y-4">
      <div class="animate-spin text-4xl">🔮</div>
      <p class="text-lg font-bold text-gray-600">AI 正在根据你的路径生成战略路线图...</p>
    </div>

    <!-- Timeline View -->
    <div v-else class="space-y-12">
      <div v-for="(path, pIdx) in generatedPaths" :key="pIdx" class="space-y-4">
        
        <!-- Path Header -->
        <div class="flex items-center gap-3 border-b-2 border-black pb-2">
           <span class="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">{{ pIdx + 1 }}</span>
           <div>
             <h3 class="text-xl font-black">{{ getPathName(pIdx) }}</h3>
             <p class="text-xs text-gray-500 font-bold">权重: {{ getPathWeight(pIdx) }}%</p>
           </div>
        </div>

        <!-- Milestones Grid (Fixed: replaced horizontal scroll with grid) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          <div 
            v-for="(ms, mIdx) in path.milestones" 
            :key="mIdx"
            class="bg-white border-2 border-black rounded-xl p-4 shadow-hard flex flex-col justify-between relative group min-h-[160px]"
          >
            <!-- Connector Line (Visual only - hidden in grid for clarity or adjusted) -->
            <!-- <div v-if="mIdx < path.milestones.length - 1" class="absolute top-1/2 -right-6 w-6 h-1 bg-black z-0 hidden lg:block"></div> -->

            <div class="space-y-2 relative z-10">
               <div class="flex justify-between items-start">
                 <span class="bg-gray-100 text-xs font-bold px-2 py-1 rounded">M{{ Number(mIdx) + 1 }}</span>
                 <input 
                    type="number" 
                    v-model.number="ms.weeks" 
                    class="w-12 text-right font-mono font-bold border-b border-gray-300 focus:border-black outline-none no-spinner"
                 />
                 <span class="text-xs font-bold text-gray-400 absolute right-0 top-1 translate-y-6">周</span>
               </div>
               
               <textarea 
                  v-model="ms.name"
                  rows="2"
                  class="w-full font-bold text-lg leading-tight bg-transparent focus:outline-none resize-none border-b border-transparent focus:border-gray-200 transition-colors"
                  placeholder="里程碑名称"
               ></textarea>
               
               <textarea 
                  v-model="ms.criteria"
                  rows="2"
                  class="w-full text-xs text-gray-500 leading-snug bg-transparent focus:outline-none resize-none border-b border-transparent focus:border-gray-100 transition-colors"
                  placeholder="定义你的验收标准或目标..."
               ></textarea>
            </div>

            <div class="pt-4 mt-2 border-t border-gray-100 flex justify-between items-center">
               <span class="text-xs font-bold text-gray-400">
                 {{ calculateDates(path, Number(mIdx)) }}
               </span>
               <!-- Trash icon for deletion could be added here -->
            </div>
          </div>

          <!-- Add Button -->
          <button 
            @click="addMilestone(pIdx)"
            class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-100 hover:border-black transition-all min-h-[160px]"
          >
            <div class="flex flex-col items-center gap-2 text-gray-400">
                <UIcon name="i-lucide-plus" class="w-8 h-8" />
                <span class="text-xs font-bold">添加里程碑</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="!loading" class="flex justify-between pt-8 border-t-2 border-gray-100">
       <UButton @click="router.back()" variant="ghost" color="gray">上一步</UButton>
       
       <UButton 
          @click="next" 
          size="xl" 
          color="black" 
          class="px-12 font-bold"
        >
          确认路线，生成首月任务
          <UIcon name="i-lucide-list-todo" />
        </UButton>
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
const loading = ref(true)
const generatedPaths = ref<any[]>([])

onMounted(async () => {
  // If we already generated milestones in store (and came back), use them
  if (store.generatedPlan && store.generatedPlan.milestones) {
      generatedPaths.value = store.generatedPlan.milestones
      loading.value = false
      return
  }

  try {
    const res: any = await $fetch('/api/wizard/ai/milestones', {
      method: 'POST',
      body: {
        paths: store.paths,
        deadline: store.deadline,
        goal: store.incomeGoal,
        profile: store.profile
      }
    })
    
    generatedPaths.value = res.paths
  } catch (e) {
    console.error(e)
    // Fallback?
  } finally {
    loading.value = false
  }
})

function getPathName(idx: number) {
  return store.paths[idx]?.name || `Path ${idx + 1}`
}

function getPathWeight(idx: number) {
  return store.paths[idx]?.weight || 0
}

function calculateDates(path: any, mIdx: number) {
  // Simple date projection based on weeks
  // Start date = today or path start date
  // This is purely visual for L3
  let currentOffset = 0
  for (let i = 0; i < mIdx; i++) {
    currentOffset += Number(path.milestones[i].weeks) || 0
  }
  
  const startWeeks = currentOffset
  const duration = Number(path.milestones[mIdx].weeks) || 0
  
  return `第 ${startWeeks + 1} - ${startWeeks + duration} 周`
}

function addMilestone(pIdx: number) {
  generatedPaths.value[pIdx].milestones.push({
    name: '新里程碑',
    weeks: 4,
    criteria: '定义你的目标'
  })
}

function next() {
  // Save L3 Bone structure to store
  store.setGeneratedPlan({
    ...store.generatedPlan,
    milestones: generatedPaths.value
  })
  
  router.push('/wizard/plan')
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-spinner::-webkit-inner-spin-button, 
.no-spinner::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
.no-spinner {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
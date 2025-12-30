<template>
  <div class="space-y-8">
    <div class="text-center">
      <h2 class="text-2xl md:text-3xl font-black">AI 推荐组合</h2>
      <p class="text-gray-500 font-medium mt-2">
        基于你的目标 ({{ store.incomeGoal }}万)，我为你定制了这套方案
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12 space-y-4">
      <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin text-toon-500" />
      <p class="font-bold text-gray-500 animate-pulse">正在疯狂计算最佳赚钱路径...</p>
    </div>

    <!-- Paths Grid -->
    <div v-else class="grid gap-4">
      <div 
        v-for="(path, idx) in recommendedPaths" 
        :key="idx"
        @click="togglePath(path)"
        class="border-3 rounded-xl p-6 transition-all cursor-pointer relative"
        :class="isSelected(path) ? 'border-black bg-toon-50 shadow-hard' : 'border-gray-200 bg-white hover:border-gray-400'"
      >
        <div class="flex justify-between items-start">
            <div>
                <div class="flex items-center gap-2 mb-2">
                    <span class="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-md uppercase">{{ path.category }}</span>
                    <h3 class="font-bold text-xl">{{ path.name }}</h3>
                </div>
                <p class="text-gray-600 text-sm">{{ path.reason }}</p>
            </div>
            <div class="text-right">
                <span class="block text-2xl font-black">{{ path.incomeMin }}-{{ path.incomeMax }}万</span>
                <span class="text-xs text-gray-400">预估年收</span>
            </div>
        </div>
        
        <!-- Checkbox Corner -->
        <div class="absolute top-4 right-4">
            <UIcon v-if="isSelected(path)" name="i-lucide-check-circle-2" class="w-6 h-6 text-black fill-toon-500" />
            <UIcon v-else name="i-lucide-circle" class="w-6 h-6 text-gray-300" />
        </div>
      </div>
    </div>

    <!-- Summary & Action -->
    <div v-if="!loading" class="pt-6 border-t-3 border-gray-100">
        <div class="flex justify-between items-center mb-6">
            <span class="text-gray-500 font-bold">选中组合预估总收入：</span>
            <span class="text-3xl font-black" :class="totalIncome >= (store.incomeGoal || 0) ? 'text-green-600' : 'text-orange-500'">
                {{ totalIncome }} 万
            </span>
        </div>
        
         <div v-if="totalIncome < (store.incomeGoal || 0)" class="bg-orange-50 border-2 border-orange-200 p-3 rounded-lg text-sm text-orange-800 mb-6 flex items-center gap-2">
            <UIcon name="i-lucide-alert-triangle" />
             当前组合可能无法达成你的目标 ({{ store.incomeGoal }}万)，建议多选一条或调整目标。
         </div>

        <div class="flex justify-between">
            <UButton @click="router.back()" variant="ghost" color="gray">上一步</UButton>
            <UButton @click="next" size="xl" color="black" class="px-12 font-bold">确认方案</UButton>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'

const store = useWizardStore()
const router = useRouter()
const loading = ref(true)
const recommendedPaths = ref<any[]>([])
const selectedPaths = ref<any[]>([])

const totalIncome = computed(() => {
    // Calculate simple max range sum for now
    return selectedPaths.value.reduce((acc, curr) => acc + curr.incomeMax, 0)
})

const isSelected = (path: any) => selectedPaths.value.some(p => p.name === path.name)

function togglePath(path: any) {
    if (isSelected(path)) {
        selectedPaths.value = selectedPaths.value.filter(p => p.name !== path.name)
    } else {
        selectedPaths.value.push(path)
    }
}

async function fetchRecommendations() {
    try {
        const res = await $fetch('/api/wizard/ai/recommend', {
            method: 'POST',
            body: {
                context: {
                    incomeGoal: store.incomeGoal,
                    profile: store.profile,
                    openQuestion: store.openQuestion
                }
            }
        })
        if (res.success && (res as any).data) {
            recommendedPaths.value = (res as any).data.paths
            // Default select all
            selectedPaths.value = [...(res as any).data.paths]
        }
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

function next() {
    store.setPaths(selectedPaths.value)
    router.push('/wizard/setup')
}

onMounted(() => {
    fetchRecommendations()
})
</script>

<template>
  <div class="space-y-8">
    <div class="text-center">
      <h2 class="text-2xl md:text-3xl font-black">你的 {{ targetYear }} 赚钱时间线</h2>
      <p class="text-gray-500 font-medium">共 {{ store.paths.length }} 条路径，预计收入 {{ totalIncome }} 万</p>
    </div>

    <!-- Timeline Viz -->
    <div class="border-3 border-black bg-toon-50 p-6 rounded-xl relative overflow-hidden">
        <div class="absolute left-8 top-0 bottom-0 w-1 bg-gray-300 border-l-2 border-dashed border-gray-400"></div>
        
        <div v-if="store.paths.length === 0" class="text-center py-8 text-gray-500">
            暂无选择的路径，请返回上一步选择
        </div>
        
        <div v-else class="space-y-6 relative">
            <div 
              v-for="(path, idx) in store.paths" 
              :key="idx"
              class="flex gap-4 items-start"
            >
                <div class="w-16 pt-1 text-right font-bold text-gray-500">
                    路径{{ idx + 1 }}
                </div>
                <div class="flex-1 bg-white border-2 border-black p-4 rounded-lg shadow-sm">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-bold text-lg">{{ path.name }}</div>
                            <div class="text-sm text-gray-600 mt-1">{{ path.description || path.reason || '待规划' }}</div>
                        </div>
                        <div class="text-right">
                            <div class="font-black text-toon-600">{{ path.incomeMax || path.incomeMin || '?' }}万</div>
                            <div class="text-xs text-gray-400">目标年收</div>
                        </div>
                    </div>
                    <div class="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <span class="bg-gray-100 px-2 py-1 rounded mr-2">{{ path.category || '未分类' }}</span>
                        <span v-if="path.rampUpMonths">爬坡期 {{ path.rampUpMonths }} 个月</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Summary -->
    <div class="bg-white border-3 border-black p-6 rounded-xl">
        <div class="grid grid-cols-3 gap-4 text-center">
            <div>
                <div class="text-3xl font-black">{{ store.paths.length }}</div>
                <div class="text-sm text-gray-500">条路径</div>
            </div>
            <div>
                <div class="text-3xl font-black text-green-600">{{ totalIncome }}</div>
                <div class="text-sm text-gray-500">万预估年收</div>
            </div>
            <div>
                <div class="text-3xl font-black">{{ targetYear }}</div>
                <div class="text-sm text-gray-500">目标年份</div>
            </div>
        </div>
    </div>
    
    <div v-if="error" class="text-red-500 text-center font-bold">
        {{ error }}
    </div>

    <div class="flex justify-between pt-6 border-t-3 border-gray-100">
        <UButton 
            @click="router.back()" 
            variant="ghost" 
            color="gray"
            :disabled="saving"
        >
            上一步
        </UButton>
        <UButton 
            @click="save" 
            :loading="saving"
            size="xl" color="black" 
            class="px-12 font-bold"
        >
            确认并开始执行
        </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'
const store = useWizardStore()
const { user } = useUser()
const router = useRouter()
const saving = ref(false)
const error = ref('')

// 动态计算目标年份
const now = new Date()
const targetYear = computed(() => {
  const month = now.getMonth()
  const year = now.getFullYear()
  return month >= 9 ? year + 1 : year
})

// 计算总预估收入
const totalIncome = computed(() => {
    return store.paths.reduce((acc, path) => acc + (path.incomeMax || path.incomeMin || 0), 0)
})

async function save() {
    if (!user.value) {
        error.value = "请先登录"
    }
    
    saving.value = true
    error.value = ''
    
    try {
        const userId = user.value?.id || 'mock-user-id'
        
        await $fetch('/api/wizard/save', {
            method: 'POST',
            body: {
                user_id: userId,
                plan: {
                    incomeGoal: store.incomeGoal,
                    paths: store.paths
                }
            }
        })
        
        router.push('/dashboard')
    } catch (e: any) {
        console.error(e)
        error.value = "保存失败: " + e.message
    } finally {
        saving.value = false
    }
}
</script>

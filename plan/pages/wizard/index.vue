<template>
  <div class="flex flex-col items-center justify-center space-y-12 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="text-center">
      <div class="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-500">检查规划状态...</p>
    </div>

    <!-- Has Existing Plan -->
    <div v-else-if="existingGoal" class="w-full max-w-lg space-y-8">
      <div class="text-center space-y-4">
        <h2 class="text-3xl md:text-4xl font-black">您已有规划</h2>
        <p class="text-gray-500 font-medium text-lg">{{ existingGoal.year }}年目标：{{ formatGoal(existingGoal.income_target) }}万元</p>
      </div>

      <!-- Summary Card -->
      <div class="bg-yellow-50 border-4 border-black rounded-2xl p-6 shadow-hard">
        <div class="grid grid-cols-3 gap-4 text-center mb-6">
          <div>
            <div class="text-3xl font-black">{{ existingGoal.pathCount || 0 }}</div>
            <div class="text-sm text-gray-500">条路径</div>
          </div>
          <div>
            <div class="text-3xl font-black">{{ existingGoal.projectCount || 0 }}</div>
            <div class="text-sm text-gray-500">个项目</div>
          </div>
          <div>
            <div class="text-3xl font-black">{{ existingGoal.taskCount || 0 }}</div>
            <div class="text-sm text-gray-500">个任务</div>
          </div>
        </div>
        <div class="text-center text-sm text-gray-400">
          创建于 {{ formatDate(existingGoal.created_at) }}
        </div>
      </div>

      <!-- Options -->
      <div class="space-y-4">
        <UButton 
          block 
          size="xl" 
          color="black" 
          @click="goToDashboard"
          class="font-bold"
        >
          📊 查看我的规划
        </UButton>
        
        <UButton 
          block 
          size="xl" 
          variant="outline" 
          color="black"
          @click="editPlan"
          class="font-bold"
        >
          ✏️ 修改调整
        </UButton>
        
        <UButton 
          block 
          size="xl" 
          variant="ghost" 
          color="red"
          @click="confirmRestart"
          class="font-bold"
        >
          🔄 放弃旧规划，重新开始
        </UButton>
      </div>
    </div>

    <!-- Restart Confirmation Modal -->
    <UModal v-model="showRestartModal">
      <div class="p-6 space-y-4">
        <h3 class="text-xl font-black text-center">⚠️ 确认重新开始？</h3>
        <p class="text-gray-600 text-center">
          这将会<span class="text-red-600 font-bold">清除您当前的规划</span>，意味着现在的<b>日历任务、执行看板、进度统计</b>都会被清零。此操作不可撤销。
        </p>
        <div class="flex gap-4 pt-4">
          <UButton block variant="ghost" color="gray" @click="showRestartModal = false">
            取消
          </UButton>
          <UButton block color="red" :loading="restarting" @click="doRestart">
            确认重新开始
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'

definePageMeta({
    layout: 'blank'
})

const store = useWizardStore()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const existingGoal = ref<any>(null)
const showRestartModal = ref(false)
const restarting = ref(false)

// 检查是否有已存在的规划
onMounted(async () => {
  store.currentStep = 1
  
  try {
    const data = await $fetch('/api/goals/active') as any
    if (data && data.id) {
      existingGoal.value = data
      loading.value = false
    } else {
      // 没有已存在规划，重定向到着陆页
      router.replace('/')
    }
  } catch (e) {
    // 没有已存在规划或发生错误，重定向到着陆页
    router.replace('/')
  }
})

function formatGoal(target: number) {
  return (target / 10000).toFixed(0)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function goToDashboard() {
  router.push('/dashboard')
}

function editPlan() {
  router.push('/dashboard/projects')
}

function confirmRestart() {
  showRestartModal.value = true
}

async function doRestart() {
  restarting.value = true
  try {
    await $fetch('/api/goals/archive', { method: 'POST' })
    store.$reset()
    existingGoal.value = null
    showRestartModal.value = false
    
    toast.add({
      title: '已清除旧规划',
      description: '现在可以开始新的规划',
      color: 'green'
    })
    
    // 清除后重定向到着陆页开始新规划
    router.push('/')
  } catch (e: any) {
    toast.add({
      title: '操作失败',
      description: e.message,
      color: 'red'
    })
  } finally {
    restarting.value = false
  }
}
</script>

<style scoped>
.shadow-hard {
  box-shadow: 8px 8px 0px 0px #000;
}
</style>

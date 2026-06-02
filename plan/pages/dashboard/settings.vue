<template>
  <div class="max-w-2xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <UButton variant="ghost" color="gray" icon="i-lucide-arrow-left" to="/dashboard" />
      <h1 class="text-3xl font-black">规划设置</h1>
    </div>

    <!-- Current Plan Info -->
    <div class="bg-white border-4 border-black rounded-3xl p-8 shadow-hard space-y-6">
        <h2 class="text-xl font-bold flex items-center gap-2">
            <UIcon name="i-lucide-target" class="text-yellow-500" />
            当前目标
        </h2>
        
        <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-black transition-colors">
                <div class="text-sm text-gray-500 font-bold mb-1">年度目标金额</div>
                <div class="text-2xl font-black">¥{{ plan ? formatNumber(plan.income_target) : 'Loading...' }}</div>
            </div>
            <div class="p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-black transition-colors">
                <div class="text-sm text-gray-500 font-bold mb-1">规划创建时间</div>
                <div class="text-xl font-bold">{{ plan ? formatDate(plan.created_at) : 'Loading...' }}</div>
            </div>
        </div>
        
        <div class="text-xs text-gray-400">
            * 如需修改金额，建议重新规划以获得更准确的任务拆解。
        </div>
    </div>

    <!-- Danger Zone -->
    <div class="border-t-2 border-dashed border-gray-300 pt-8">
        <h3 class="text-red-600 font-black text-lg mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-alert-triangle" />
            危险区域
        </h3>
        
        <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="space-y-1">
                <div class="font-bold text-red-900">放弃当前规划</div>
                <div class="text-sm text-red-700 opacity-80">这将归档当前目标和所有关联任务，并带你回到开始页面重新制定计划。此操作不可撤销。</div>
            </div>
            <UButton 
                color="red" 
                variant="solid" 
                :loading="loading"
                class="whitespace-nowrap"
                @click="confirmReset"
            >
                放弃规划并重置
            </UButton>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'default'
})

const plan = ref<any>(null)
const loading = ref(false)
const toast = useToast()

function formatNumber(num: number) {
    return Number(num).toLocaleString('zh-CN')
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('zh-CN')
}

// Fetch active plan details
const { data } = await useFetch('/api/goals/active')
if (data.value) {
    plan.value = data.value
}

async function confirmReset() {
    if (!confirm('确定要放弃当前规划吗？所有进度将被归档。')) return

    loading.value = true
    try {
        await $fetch('/api/goals/archive', { method: 'POST' })
        toast.add({
            title: '规划已重置',
            description: '正在跳转回首页...',
            color: 'green'
        })
        // Force full reload to reset state and trigger middleware redirect
        window.location.href = '/'
    } catch (e: any) {
        toast.add({
            title: '重置失败',
            description: e.message,
            color: 'red'
        })
        loading.value = false
    }
}
</script>

<style scoped>
.shadow-hard {
    box-shadow: 8px 8px 0px 0px #000;
}
</style>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
        <UButton icon="i-lucide-arrow-left" color="white" to="/dashboard" />
        <h1 class="text-3xl font-black">💰 收入明细</h1>
    </div>

    <!-- Stats Summary -->
    <div class="bg-yellow-400 border-4 border-black rounded-xl p-6 shadow-hard">
        <div class="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Total Income</div>
        <div class="text-5xl font-black">{{ totalIncome }} <span class="text-lg">元</span></div>
    </div>

    <!-- List -->
    <div class="space-y-4">
        <div v-if="loading" class="text-center py-12">
            <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin" />
        </div>
        
        <div v-else-if="records.length > 0" class="space-y-3">
            <div 
                v-for="record in records" 
                :key="record.id"
                class="bg-white border-3 border-black rounded-xl p-4 shadow-hard-sm hover:translate-x-1 transition-transform flex justify-between items-center"
            >
                <div>
                    <div class="font-bold text-lg">¥{{ record.amount }}</div>
                    <div class="text-xs text-gray-500 font-bold flex items-center gap-2 mt-1">
                        <span class="bg-gray-100 px-2 py-0.5 rounded border border-black/10">
                            {{ new Date(record.recorded_at).toLocaleDateString() }}
                        </span>
                        <span v-if="record.projects" class="flex items-center gap-1">
                            <UIcon name="i-lucide-folder" class="w-3 h-3" />
                            {{ record.projects.name }}
                        </span>
                        <span v-else class="text-gray-400 italic">无项目</span>
                    </div>
                    <div v-if="record.note" class="text-sm mt-2 font-medium">
                        {{ record.note }}
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-12 space-y-4">
            <div class="text-6xl">🈳</div>
            <div class="font-bold text-gray-400">还没有收入记录，快去搞钱！</div>
            <UButton color="black" to="/dashboard">去记录</UButton>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'default'
})

const loading = ref(true)
const records = ref<any[]>([])

const totalIncome = computed(() => {
    return records.value.reduce((sum, r) => sum + Number(r.amount), 0).toLocaleString()
})

async function loadData() {
    loading.value = true
    try {
        const data = await $fetch('/api/income')
        records.value = data as any[]
    } catch (e) {
        useToast().add({ title: '加载失败', color: 'red' })
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadData()
})
</script>

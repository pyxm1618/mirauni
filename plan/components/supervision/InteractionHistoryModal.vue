<template>
  <UModal v-model="isOpen">
    <div class="p-6 bg-white rounded-2xl border-4 border-black shadow-hard max-h-[80vh] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-black flex items-center gap-2">
           <UIcon name="i-lucide-history" /> 互动日志
        </h3>
        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" @click="isOpen = false" />
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto space-y-4 pr-2 min-h-[300px]">
         <div v-if="loading && page === 1" class="text-center py-10">
             <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-gray-400" />
         </div>

         <div v-else-if="list.length === 0" class="text-center py-10 text-gray-500 font-bold">
             还没有收到互动哦，快去邀请好友吧！
         </div>

         <div v-else class="space-y-3">
             <div v-for="item in list" :key="item.id" class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                 <!-- Avatar -->
                 <div class="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center overflow-hidden shrink-0">
                     <img v-if="item.sender_avatar" :src="item.sender_avatar" class="w-full h-full object-cover" />
                     <span v-else class="font-bold text-xs">{{ item.sender_nickname?.[0] }}</span>
                 </div>
                 
                 <div class="flex-1">
                     <div class="flex justify-between items-start">
                         <span class="font-bold">{{ item.sender_nickname }}</span>
                         <span class="text-[10px] text-gray-400 font-bold">{{ formatDate(item.created_at) }}</span>
                     </div>
                     <p class="text-sm mt-1">
                         <span v-if="item.type === 'like'" class="text-pink-600 font-bold">👍 给你点了个赞</span>
                         <span v-else-if="item.type === 'nudge'" class="text-orange-600 font-bold">⏰ 催了你一下：快去搞钱！</span>
                         <span v-else class="text-blue-600 font-bold">✨ 发送了互动</span>
                     </p>
                 </div>
             </div>
             
             <!-- Load More -->
             <div v-if="hasMore" class="text-center pt-2">
                 <UButton :loading="loading" variant="ghost" @click="loadMore">加载更多</UButton>
             </div>
         </div>
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
const isOpen = defineModel<boolean>({ default: false })
const list = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(false)

// Reset when opened
watch(isOpen, (val) => {
    if (val && list.value.length === 0) {
        fetchHistory()
    }
})

function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    
    // Less than 24h
    if (diff < 24 * 3600 * 1000) {
        if (diff < 3600 * 1000) return `${Math.ceil(diff / 60000)}分钟前`
        return `${Math.ceil(diff / 3600000)}小时前`
    }
    return `${d.getMonth()+1}月${d.getDate()}日`
}

async function fetchHistory(reset = true) {
    if (reset) {
        page.value = 1
        list.value = []
    }
    
    loading.value = true
    try {
        const res: any = await $fetch('/api/interactions/history', {
            params: { page: page.value, limit: 10 }
        })
        
        if (reset) {
            list.value = res.list
        } else {
            list.value.push(...res.list)
        }
        
        hasMore.value = res.hasMore
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

function loadMore() {
    page.value++
    fetchHistory(false)
}
</script>
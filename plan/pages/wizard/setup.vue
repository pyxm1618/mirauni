<template>
  <div class="space-y-8">
    <div class="text-center">
      <h2 class="text-2xl md:text-3xl font-black">详细配置</h2>
      <p class="text-gray-500 font-medium">调整每条路径的具体目标</p>
    </div>

    <!-- Simple Accordion or Stack for Paths -->
    <div class="space-y-6">
      <div 
        v-for="(path, idx) in store.paths" 
        :key="idx"
        class="border-3 border-black rounded-xl p-6 bg-white shadow-hard"
      >
        <h3 class="font-black text-xl mb-4 flex items-center gap-2">
            <span class="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{{ idx + 1 }}</span>
            {{ path.name }}
        </h3>
        
        <div class="space-y-4">
            <div>
                <label class="block font-bold text-sm mb-1">具体想做什么？</label>
                <input 
                    type="text" 
                    v-model="path.description" 
                    placeholder="例如：为独立开发者开发一个任务管理具"
                    class="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-black outline-none" 
                />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="block font-bold text-sm mb-1">目标收入 (万)</label>
                    <input 
                        type="number" 
                        v-model="path.incomeMax" 
                        class="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-black outline-none font-bold" 
                    />
                </div>
                 <div>
                    <label class="block font-bold text-sm mb-1">爬坡期 (月)</label>
                    <input 
                        type="number" 
                        placeholder="6"
                        class="w-full border-2 border-gray-300 rounded-lg p-2 focus:border-black outline-none" 
                    />
                </div>
            </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between pt-6 border-t-3 border-gray-100">
        <UButton @click="router.back()" variant="ghost" color="gray">上一步</UButton>
        <UButton @click="next" size="xl" color="black" class="px-12 font-bold">预览计划</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'
const store = useWizardStore()
const router = useRouter()

// Ensure description init
store.paths.forEach(p => {
    if(!p.description) p.description = ''
})

function next() {
    router.push('/wizard/timeline')
}
</script>

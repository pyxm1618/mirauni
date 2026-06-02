<template>
  <div class="relative bg-[#fdfbf7] border-4 border-double border-black p-8 shadow-hard rotate-1 hover:rotate-0 transition-transform duration-500 max-w-md mx-auto">
    <!-- Corner Decorations -->
    <div class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-black"></div>
    <div class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-black"></div>
    <div class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-black"></div>
    <div class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-black"></div>

    <!-- Title -->
    <div class="text-center mb-8">
        <h2 class="text-3xl font-black font-serif tracking-widest border-b-2 border-black inline-block pb-2 mb-1">搞钱契约</h2>
        <div class="text-[10px] font-bold tracking-[0.5em] text-gray-500 uppercase">MONEY PATH CONTRACT</div>
    </div>

    <!-- Content -->
    <div class="space-y-6 font-serif text-lg leading-relaxed text-gray-800">
        <p>
            兹证明 <span class="font-bold border-b-2 border-black px-2">{{ userName }}</span> 
            于 <span class="font-bold">{{ date }}</span> 立下誓言。
        </p>
        <p>
            将在 2026 年全力以赴，达成 
            <span class="text-3xl font-black mx-1">{{ (Number(goal) * 10000).toLocaleString() }}<span class="text-sm">元</span></span>
            的搞钱目标。
        </p>
        <p>
            若有懈怠，自愿接受监督人 
            <span class="font-bold border-b-2 border-black px-2">{{ supervisorName || '___________' }}</span> 
            的疯狂鞭策。
        </p>
    </div>

    <!-- Sign Area -->
    <div class="mt-12 flex justify-end relative">
        <div class="text-center">
            <div 
                v-if="isSigned"
                class="font-handwriting text-4xl text-red-600 -rotate-12 mb-2 animate-pulse"
                style="font-family: 'Comic Sans MS', cursive;" 
            >
                {{ supervisorName || '已阅' }}
            </div>
            <div v-else class="h-10"></div>
            
            <div class="border-t-2 border-black pt-1 w-32">
                <span class="text-xs font-bold uppercase">监督人签字</span>
            </div>
        </div>
        
        <!-- Stamp -->
        <div class="absolute -right-4 -bottom-4 opacity-10 rotate-12 pointer-events-none grayscale">
            <div class="w-24 h-24 border-4 border-red-600 rounded-full flex items-center justify-center text-red-600 font-black text-xl rotate-[-20deg]">
                <div class="border-2 border-red-600 rounded-full w-20 h-20 flex items-center justify-center text-center leading-none">
                    仅供<br/>参考
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    userName: string
    goal: number | string
    date: string
    supervisorName?: string
    isSigned?: boolean
}>()
</script>

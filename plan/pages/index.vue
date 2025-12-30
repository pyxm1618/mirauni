<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
    <div class="space-y-4 max-w-2xl">
      <h1 class="text-5xl md:text-7xl font-black italic tracking-tighter drop-shadow-hard">
        {{ targetYear }}年<br/>想赚多少钱？
      </h1>
      <p class="text-xl md:text-2xl font-medium text-gray-700">
        一张图看清你的赚钱路线，AI 帮你拆解到每天。
      </p>
    </div>

    <!-- Demo Diagram Placeholder -->
    <div class="w-full max-w-3xl h-64 border-3 border-black shadow-hard bg-white rounded-xl flex items-center justify-center overflow-hidden relative">
       <div class="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
       <div class="z-10 bg-toon-100 border-3 border-black p-4 rounded-lg transform -rotate-2 -translate-x-20">SaaS工具</div>
       <div class="z-10 text-3xl font-black">+</div>
       <div class="z-10 bg-blue-100 border-3 border-black p-4 rounded-lg transform rotate-3 translate-x-20">技术博客</div>
       <div class="z-10 absolute bottom-4 right-4 text-4xl font-black text-green-600">= 100万</div>
    </div>

    <UButton
      to="/wizard"
      size="xl"
      class="px-12 py-4 text-2xl font-black transform hover:-rotate-1 transition-transform"
      color="black"
    >
      开始规划
    </UButton>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

// 动态计算目标年份：如果当前月份>=10月，则目标年份为下一年
const now = new Date()
const targetYear = computed(() => {
  const month = now.getMonth() // 0-11
  const year = now.getFullYear()
  // 10月后开始规划下一年
  return month >= 9 ? year + 1 : year
})
</script>


<template>
  <div class="h-screen overflow-hidden flex flex-col md:flex-row font-inter">
    <!-- LEFT SIDE: Vision & Visuals (50%) -->
    <div class="w-full md:w-1/2 bg-yellow-400 border-r-4 border-black p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
      <!-- Background Decor -->
      <div class="absolute inset-0 opacity-10 pointer-events-none"
           style="background-image: linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px); background-size: 40px 40px;">
      </div>

      <!-- Top Text -->
      <div class="relative z-30 space-y-4">
        <div class="inline-block bg-black text-white px-3 py-1 font-bold text-xs uppercase tracking-widest transform -rotate-2">
          Money Path
        </div>
        <h1 class="text-4xl md:text-5xl font-black leading-tight">
          别让梦想<br>只停留在脑海里。
        </h1>
        <p class="font-bold text-lg opacity-80">
          从模糊的想法，到可执行的每一天。<br>
          AI 帮你拆解目标，生成专属执行日历。
        </p>
      </div>

      <!-- Mockup Image Area (Composite Cards) -->
      <div class="relative z-10 mt-8 md:mt-0 flex-1 flex items-center justify-center">
        <div class="relative w-full max-w-sm h-[300px]">
          <!-- CARD 1: Dashboard -->
          <div class="absolute top-0 left-0 w-4/5 bg-white border-4 border-black rounded-xl p-4 shadow-hard float-1 z-10">
            <div class="flex justify-between items-center border-b-2 border-gray-100 pb-2 mb-2">
              <div class="text-[10px] font-bold text-gray-400">PROGRESS</div>
              <div class="text-xl font-black">75%</div>
            </div>
            <div class="h-3 bg-gray-100 rounded-full border border-black overflow-hidden mb-3">
              <div class="h-full bg-black w-3/4"></div>
            </div>
            <div class="space-y-1.5">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 border border-black bg-black rounded-sm"></div>
                <div class="h-1.5 bg-gray-200 w-1/2 rounded"></div>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 border border-black bg-black rounded-sm"></div>
                <div class="h-1.5 bg-gray-200 w-2/3 rounded"></div>
              </div>
            </div>
          </div>

          <!-- CARD 2: Supervision -->
          <div class="absolute bottom-4 right-0 w-4/5 bg-white border-4 border-black rounded-xl p-4 shadow-hard-lg float-2 z-20">
            <div class="flex justify-between items-center mb-3">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
                <span class="font-black text-[10px] uppercase">监督室 LIVE</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex -space-x-2">
                <div class="w-8 h-8 rounded-full border-2 border-black bg-gray-200"></div>
                <div class="w-8 h-8 rounded-full border-2 border-black bg-gray-300"></div>
              </div>
              <div class="flex-1 bg-gray-50 border border-gray-200 rounded p-1.5">
                <div class="h-1 w-full bg-gray-300 rounded mb-1"></div>
                <div class="h-1 w-1/2 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Features (No Emojis) -->
      <div class="relative z-30 grid grid-cols-3 gap-2 mt-8 border-t-2 border-black pt-6 text-center">
        <div>
          <div class="text-xs font-black uppercase">目标拆解</div>
        </div>
        <div>
          <div class="text-xs font-black uppercase">智能排期</div>
        </div>
        <div>
          <div class="text-xs font-black uppercase">全程监督</div>
        </div>
      </div>
    </div>

    <!-- RIGHT SIDE: Interaction (50%) -->
    <div class="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-8 relative">
      <div class="w-full max-w-sm space-y-10">
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-hard-sm">
            M
          </div>
          <h2 class="text-3xl font-black">{{ targetYear }}年，你的目标是？</h2>
          <p class="text-gray-500 font-medium">大胆填，剩下的交给我们。</p>
        </div>

        <!-- Input Group -->
        <div class="space-y-6">
          <div class="relative group">
            <input 
              v-model="incomeTarget"
              type="number" 
              class="w-full text-center text-6xl font-black border-b-4 border-gray-200 bg-transparent focus:outline-none focus:border-black placeholder-gray-100 py-4 transition-colors no-spinner"
              placeholder="100"
            >
            <span class="absolute right-0 bottom-6 text-xl font-bold text-gray-400 group-focus-within:text-black transition-colors">
              万元
            </span>
          </div>
        </div>

        <!-- CTA -->
        <button 
          @click="startPlan"
          class="w-full bg-black text-white text-xl font-bold py-4 rounded-xl shadow-hard hover:translate-y-1 hover:shadow-none transition-all border-2 border-black flex items-center justify-center gap-2 cursor-pointer"
        >
          生成执行方案
        </button>
      </div>

      <!-- Corner Pattern -->
      <div class="absolute top-0 right-0 p-4 opacity-50">
        <div class="w-16 h-16 border-t-4 border-r-4 border-black rounded-tr-xl"></div>
      </div>
      <div class="absolute bottom-0 left-0 p-4 opacity-50">
        <div class="w-16 h-16 border-b-4 border-l-4 border-black rounded-bl-xl"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'blank'
})

const incomeTarget = ref(100)

// 动态计算目标年份：如果当前月份>=10月，则目标年份为下一年
const now = new Date()
const targetYear = computed(() => {
  const month = now.getMonth() // 0-11
  const year = now.getFullYear()
  // 10月后开始规划下一年
  return month >= 9 ? year + 1 : year
})

import { useWizardStore } from '~/stores/wizard'

function startPlan() {
  const store = useWizardStore()
  
  // 设置目标金额
  store.incomeGoal = Number(incomeTarget.value)
  
  // 设置默认截止日期：当年12月31日
  const defaultDeadline = `${targetYear.value}-12-31`
  store.setDeadline(defaultDeadline)
  
  store.currentStep = 2
  
  // 直接跳转到 profile 页面，跳过 wizard/index
  navigateTo('/wizard/profile')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}

.shadow-hard {
  box-shadow: 8px 8px 0px 0px #000;
}

.shadow-hard-lg {
  box-shadow: 12px 12px 0px 0px #000;
}

.shadow-hard-sm {
    box-shadow: 4px 4px 0px 0px #000;
}

.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Animation for floating effect */
.float-1 {
  animation: float1 6s ease-in-out infinite;
}

.float-2 {
  animation: float2 7s ease-in-out infinite;
}

@keyframes float1 {
  0%, 100% {
    transform: translateY(0) rotate(-2deg);
  }
  50% {
    transform: translateY(-10px) rotate(-1deg);
  }
}

@keyframes float2 {
  0%, 100% {
    transform: translateY(0) rotate(2deg);
  }
  50% {
    transform: translateY(-15px) rotate(3deg);
  }
}
</style>
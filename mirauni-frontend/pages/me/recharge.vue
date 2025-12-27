<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-5xl font-black font-display mb-12 uppercase">RECHARGE</h1>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- 侧边栏 -->
      <aside class="lg:col-span-1">
        <nav class="bg-white border-3 border-black shadow-brutal sticky top-8">
          <NuxtLink to="/me" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
            PROFILE
          </NuxtLink>
          <NuxtLink to="/me/projects" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
             MY PROJECTS
          </NuxtLink>
           <NuxtLink to="/me/messages" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
            MESSAGES
          </NuxtLink>
          <NuxtLink to="/me/recharge" class="block px-6 py-4 font-black uppercase bg-indie-primary border-black hover:bg-indie-accent transition-colors">
            RECHARGE / 充值
          </NuxtLink>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="lg:col-span-3">
        <!-- 当前余额 -->
        <div class="bg-white border-3 border-black shadow-brutal p-8 mb-12 relative overflow-hidden">
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-gray-500 font-bold uppercase mb-2">CURRENT BALANCE</p>
              <p class="text-6xl font-black">5 <span class="text-2xl font-bold text-gray-400">CREDITS</span></p>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold uppercase bg-black text-white px-3 py-1 inline-block mb-1 transform rotate-2">LIFETIME UNLOCKS</div>
              <p class="text-4xl font-black">12</p>
            </div>
          </div>
          <div class="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
             <UIcon name="i-heroicons-currency-yen" class="w-64 h-64" />
          </div>
        </div>

        <!-- 套餐选择 -->
        <h2 class="text-3xl font-black mb-8 uppercase border-l-8 border-indie-secondary pl-4">SELECT PACKAGE</h2>
        <div class="grid md:grid-cols-3 gap-6 mb-12">
          <div 
            v-for="pkg in packages" 
            :key="pkg.id"
            class="bg-white border-3 border-black shadow-brutal p-6 cursor-pointer transition-all relative group"
            :class="selectedPackage === pkg.id ? 'bg-black text-white translate-x-[2px] translate-y-[2px] shadow-none' : 'hover:shadow-brutal-hover hover:-translate-y-1'"
            @click="selectedPackage = pkg.id"
          >
            <div v-if="selectedPackage === pkg.id" class="absolute top-2 right-2 text-indie-primary">
                <UIcon name="i-heroicons-check-circle-solid" class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-black mb-4 uppercase tracking-wide">{{ pkg.name }}</h3>
            <div class="text-4xl font-black mb-4 font-display">
              ¥{{ pkg.price }}
            </div>
            <div class="border-t-2 border-dashed mb-4" :class="selectedPackage === pkg.id ? 'border-gray-700' : 'border-gray-300'"></div>
            <p class="font-bold mb-2 uppercase">{{ pkg.credits }} UNLOCKS</p>
            <p class="text-sm font-mono opacity-70">{{ pkg.perCredit }} CNY / UNLOCK</p>
          </div>
        </div>

        <!-- 首充优惠提示 -->
        <div class="bg-indie-accent border-3 border-black p-6 mb-12 shadow-brutal flex items-center gap-6">
            <div class="text-5xl bg-white border-3 border-black w-20 h-20 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <UIcon name="i-heroicons-gift-solid" class="w-10 h-10" />
            </div>
            <div>
              <p class="font-black text-xl uppercase mb-1">FIRST TOP-UP BONUS</p>
              <p class="font-bold">GET 20% OFF + 30% EXTRA CREDITS ON YOUR FIRST PURCHASE!</p>
            </div>
        </div>

        <!-- 支付按钮 -->
        <button class="w-full md:w-auto px-12 py-5 bg-[#07C160] text-white border-3 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-black text-2xl uppercase flex items-center justify-center gap-3">
          <UIcon name="i-ri-wechat-pay-fill" class="w-8 h-8" />
          WECHAT PAY ¥{{ selectedPackageInfo?.price || 0 }}
        </button>

        <!-- 解锁记录 -->
        <div class="mt-20">
          <h2 class="text-3xl font-black mb-8 uppercase border-l-8 border-black pl-4">HISTORY</h2>
          <div class="bg-white border-3 border-black shadow-brutal">
            <div v-for="i in 5" :key="i" class="p-6 border-b-3 border-black last:border-b-0 flex items-center justify-between group hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-indie-secondary border-3 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                   <UIcon name="i-heroicons-user-solid" class="w-6 h-6" />
                </div>
                <div>
                  <p class="font-black uppercase text-lg">USER_NICKNAME</p>
                  <p class="text-sm font-bold text-gray-500 uppercase">UNLOCKED VIA "PROJECT NAME"</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-gray-400 mb-1 font-mono">2024-12-25</p>
                <NuxtLink to="#" class="text-sm font-black uppercase text-black border-b-2 border-black hover:bg-black hover:text-white transition-colors">SEND MESSAGE</NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const packages = [
  { id: 'basic', name: '基础包', price: 30, credits: 10, perCredit: '3.0' },
  { id: 'standard', name: '标准包', price: 50, credits: 30, perCredit: '1.7' },
  { id: 'premium', name: '高级包', price: 100, credits: 100, perCredit: '1.0' }
]

const selectedPackage = ref('standard')

const selectedPackageInfo = computed(() => 
  packages.find(p => p.id === selectedPackage.value)
)

useSeoMeta({
  title: '充值 - 小概率',
  robots: 'noindex'
})
</script>

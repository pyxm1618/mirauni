<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-display font-bold mb-8">充值</h1>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- 侧边栏 -->
      <aside class="lg:col-span-1">
        <nav class="bg-white border-2 border-indie-border shadow-brutal">
          <NuxtLink to="/me" class="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
            个人资料
          </NuxtLink>
          <NuxtLink to="/me/projects" class="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
            我的项目
          </NuxtLink>
          <NuxtLink to="/me/messages" class="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
            站内信
          </NuxtLink>
          <NuxtLink to="/me/recharge" class="block px-6 py-4 font-bold bg-indie-primary">
            充值
          </NuxtLink>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="lg:col-span-3">
        <!-- 当前余额 -->
        <div class="bg-white border-2 border-indie-border shadow-brutal p-6 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 mb-1">当前解锁次数</p>
              <p class="text-4xl font-bold">5 <span class="text-lg font-normal text-gray-500">次</span></p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">已解锁 12 人</p>
            </div>
          </div>
        </div>

        <!-- 套餐选择 -->
        <h2 class="text-2xl font-bold mb-6">选择套餐</h2>
        <div class="grid md:grid-cols-3 gap-6 mb-8">
          <div 
            v-for="pkg in packages" 
            :key="pkg.id"
            class="bg-white border-2 border-indie-border shadow-brutal p-6 cursor-pointer hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            :class="selectedPackage === pkg.id ? 'ring-4 ring-indie-primary' : ''"
            @click="selectedPackage = pkg.id"
          >
            <h3 class="text-xl font-bold mb-2">{{ pkg.name }}</h3>
            <div class="text-3xl font-bold mb-2">
              ¥{{ pkg.price }}
            </div>
            <p class="text-gray-500 mb-4">{{ pkg.credits }} 次解锁</p>
            <p class="text-sm text-indie-accent">{{ pkg.perCredit }} 元/次</p>
          </div>
        </div>

        <!-- 首充优惠提示 -->
        <div class="bg-indie-accent/10 border-2 border-indie-accent p-4 mb-8">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🎉</span>
            <div>
              <p class="font-bold text-indie-accent">新用户首充优惠</p>
              <p class="text-sm">首次充值享 8折 + 额外赠送 30% 次数！</p>
            </div>
          </div>
        </div>

        <!-- 支付按钮 -->
        <button class="w-full md:w-auto px-12 py-4 bg-[#07C160] text-white border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover transition-all font-bold text-lg">
          微信支付 ¥{{ selectedPackageInfo?.price || 0 }}
        </button>

        <!-- 解锁记录 -->
        <div class="mt-12">
          <h2 class="text-2xl font-bold mb-6">解锁记录</h2>
          <div class="bg-white border-2 border-indie-border shadow-brutal">
            <div v-for="i in 5" :key="i" class="p-4 border-b border-gray-100 last:border-b-0 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-indie-secondary border border-indie-border rounded-full flex items-center justify-center">
                  👤
                </div>
                <div>
                  <p class="font-bold">用户昵称</p>
                  <p class="text-sm text-gray-500">通过项目「项目名称」解锁</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">2024-12-25</p>
                <NuxtLink to="#" class="text-sm text-indie-accent hover:underline">发消息</NuxtLink>
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

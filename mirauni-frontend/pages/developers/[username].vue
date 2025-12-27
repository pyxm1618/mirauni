<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <NuxtLink to="/developers" class="text-gray-500 hover:text-indie-text">← 返回开发者列表</NuxtLink>
    </div>

    <!-- 开发者头部 -->
    <div class="bg-white border-2 border-indie-border shadow-brutal p-8 mb-8">
      <div class="flex flex-col md:flex-row items-start gap-6">
        <div class="w-24 h-24 bg-indie-secondary border-2 border-indie-border rounded-full flex items-center justify-center text-4xl flex-shrink-0">
          👤
        </div>
        <div class="flex-1">
          <h1 class="text-3xl font-display font-bold mb-2">开发者昵称</h1>
          <p class="text-lg text-gray-500 mb-4">全栈开发工程师 · 北京 · 5年经验</p>
          <p class="text-gray-600 mb-4">热爱独立开发，擅长前后端开发。正在寻找有意思的 SaaS 项目，偏好远程合作。</p>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 bg-gray-100 border border-gray-300">Vue.js</span>
            <span class="px-3 py-1 bg-gray-100 border border-gray-300">Node.js</span>
            <span class="px-3 py-1 bg-gray-100 border border-gray-300">PostgreSQL</span>
            <span class="px-3 py-1 bg-gray-100 border border-gray-300">Docker</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 两栏布局 -->
    <div class="grid lg:grid-cols-3 gap-8">
      <!-- 左侧：详细信息 -->
      <div class="lg:col-span-2 space-y-6">
        <section class="bg-white border-2 border-indie-border shadow-brutal p-6">
          <h2 class="text-xl font-bold mb-4">个人简介</h2>
          <div class="prose max-w-none">
            <p>这里是开发者的详细简介...</p>
          </div>
        </section>

        <section class="bg-white border-2 border-indie-border shadow-brutal p-6">
          <h2 class="text-xl font-bold mb-4">社交链接</h2>
          <div class="space-y-3">
            <a href="#" class="flex items-center gap-3 text-gray-600 hover:text-indie-text">
              <span class="text-xl">📦</span>
              <span>GitHub: github.com/username</span>
            </a>
            <a href="#" class="flex items-center gap-3 text-gray-600 hover:text-indie-text">
              <span class="text-xl">📺</span>
              <span>B站: space.bilibili.com/xxx</span>
            </a>
          </div>
        </section>
      </div>

      <!-- 右侧：联系方式 -->
      <div class="space-y-6">
        <div class="bg-white border-2 border-indie-border shadow-brutal p-6">
          <h3 class="text-lg font-bold mb-4">联系 Ta</h3>
          <div class="text-center py-8 text-gray-400">
            <div class="text-4xl mb-4">🔒</div>
            <p class="mb-4">解锁后可查看联系方式并发送消息</p>
            <button class="w-full px-6 py-3 bg-indie-primary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover transition-all font-bold">
              解锁联系方式（消耗 1 次）
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const username = route.params.username

useSeoMeta({
  title: '开发者昵称 - 独立开发者 | 小概率',
  description: '开发者简介内容...',
  ogTitle: '开发者昵称 - 独立开发者',
  ogType: 'profile'
})
</script>

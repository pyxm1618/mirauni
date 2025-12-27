<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <NuxtLink to="/projects" class="text-gray-500 hover:text-indie-text">← 返回项目列表</NuxtLink>
    </div>

    <!-- 项目头部 -->
    <div class="bg-white border-2 border-indie-border shadow-brutal p-8 mb-8">
      <div class="flex items-center gap-3 mb-4">
        <span class="px-3 py-1 bg-indie-secondary text-sm border border-indie-border font-bold">SaaS 工具</span>
        <span class="px-3 py-1 bg-gray-100 text-sm border border-gray-300">远程办公</span>
        <span class="px-3 py-1 bg-indie-accent text-white text-sm">股权合作</span>
      </div>
      <h1 class="text-4xl font-display font-bold mb-4">项目标题占位</h1>
      <p class="text-xl text-gray-600 mb-6">这是项目的一句话简介，描述项目的核心价值和目标用户群体</p>
      
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex items-center gap-2">
          <span class="text-gray-500">招募角色：</span>
          <span class="px-2 py-1 bg-indie-primary text-sm border border-indie-border">前端开发</span>
          <span class="px-2 py-1 bg-indie-primary text-sm border border-indie-border">后端开发</span>
        </div>
      </div>

      <div class="flex items-center gap-4 pt-6 border-t border-gray-200">
        <div class="w-12 h-12 bg-indie-secondary border-2 border-indie-border rounded-full flex items-center justify-center">
          👤
        </div>
        <div>
          <p class="font-bold">发布者昵称</p>
          <p class="text-sm text-gray-500">发布于 3天前 · 浏览 128 次</p>
        </div>
      </div>
    </div>

    <!-- 两栏布局 -->
    <div class="grid lg:grid-cols-3 gap-8">
      <!-- 左侧：项目详情 -->
      <div class="lg:col-span-2 space-y-6">
        <section class="bg-white border-2 border-indie-border shadow-brutal p-6">
          <h2 class="text-xl font-bold mb-4">项目详情</h2>
          <div class="prose max-w-none">
            <p>这里是项目的详细描述内容，支持富文本展示...</p>
            <p>项目的背景、愿景、团队信息等内容会在这里展示。</p>
          </div>
        </section>

        <section class="bg-white border-2 border-indie-border shadow-brutal p-6">
          <h2 class="text-xl font-bold mb-4">技能要求</h2>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 bg-gray-100 border border-gray-300">Vue.js</span>
            <span class="px-3 py-1 bg-gray-100 border border-gray-300">Node.js</span>
            <span class="px-3 py-1 bg-gray-100 border border-gray-300">PostgreSQL</span>
          </div>
        </section>
      </div>

      <!-- 右侧：联系方式 -->
      <div class="space-y-6">
        <div class="bg-white border-2 border-indie-border shadow-brutal p-6">
          <h3 class="text-lg font-bold mb-4">联系发布者</h3>
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
const id = route.params.id

useSeoMeta({
  title: '项目标题 - 招募技术合伙人 | 小概率',
  description: '项目的一句话简介',
  ogTitle: '项目标题 - 招募技术合伙人',
  ogDescription: '项目的一句话简介',
  ogType: 'article'
})
</script>

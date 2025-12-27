<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-display font-bold mb-8">创业项目招募</h1>
    
    <!-- 筛选栏 -->
    <div class="bg-white border-2 border-indie-border shadow-brutal p-4 mb-8">
      <div class="flex flex-wrap gap-4">
        <select class="px-4 py-2 border-2 border-indie-border bg-white">
          <option value="">全部分类</option>
          <option value="saas">SaaS 工具</option>
          <option value="app">移动应用</option>
          <option value="game">游戏</option>
          <option value="ai">AI / 人工智能</option>
          <option value="ecommerce">电商</option>
          <option value="content">内容/社区</option>
          <option value="hardware">智能硬件</option>
          <option value="other">其他</option>
        </select>
        <select class="px-4 py-2 border-2 border-indie-border bg-white">
          <option value="">工作模式</option>
          <option value="remote">远程办公</option>
          <option value="onsite">坐班</option>
          <option value="hybrid">混合办公</option>
        </select>
        <input 
          type="text" 
          placeholder="搜索项目..."
          class="flex-1 min-w-[200px] px-4 py-2 border-2 border-indie-border"
        />
      </div>
    </div>

    <!-- 项目列表占位 -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white border-2 border-indie-border shadow-brutal p-6 hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer">
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2 py-1 bg-indie-secondary text-sm border border-indie-border">SaaS 工具</span>
          <span class="px-2 py-1 bg-gray-100 text-sm border border-gray-300">远程</span>
        </div>
        <h3 class="text-xl font-bold mb-2">项目名称占位</h3>
        <p class="text-gray-600 mb-4 line-clamp-2">这是项目的一句话简介，描述项目的核心价值和目标用户群体...</p>
        <div class="flex flex-wrap gap-2 mb-4">
          <span class="px-2 py-1 bg-indie-primary text-sm">招募：前端开发</span>
          <span class="px-2 py-1 bg-indie-primary text-sm">后端开发</span>
        </div>
        <div class="text-sm text-gray-500">股权合作 · 发布于 2天前</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: '创业项目招募 - 小概率',
  description: '浏览独立开发者的创业项目，找到感兴趣的项目加入，成为技术合伙人',
  ogTitle: '创业项目招募 - 小概率',
  ogDescription: '浏览独立开发者的创业项目，找到感兴趣的项目加入'
})
</script>

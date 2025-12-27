<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-display font-bold mb-8">独立开发者学院</h1>
    
    <!-- 分类标签 -->
    <div class="flex flex-wrap gap-3 mb-8">
      <button class="px-4 py-2 bg-indie-primary border-2 border-indie-border shadow-brutal font-bold">全部</button>
      <button class="px-4 py-2 bg-white border-2 border-indie-border hover:shadow-brutal-hover transition-all">创业经验</button>
      <button class="px-4 py-2 bg-white border-2 border-indie-border hover:shadow-brutal-hover transition-all">技术分享</button>
      <button class="px-4 py-2 bg-white border-2 border-indie-border hover:shadow-brutal-hover transition-all">合伙指南</button>
      <button class="px-4 py-2 bg-white border-2 border-indie-border hover:shadow-brutal-hover transition-all">产品思考</button>
    </div>

    <!-- 文章列表占位 -->
    <div class="space-y-6">
      <article v-for="i in 5" :key="i" class="bg-white border-2 border-indie-border shadow-brutal p-6 hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer">
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2 py-1 bg-indie-accent text-white text-sm">创业经验</span>
        </div>
        <h2 class="text-2xl font-bold mb-3">如何找到靠谱的技术合伙人？</h2>
        <p class="text-gray-600 mb-4 line-clamp-2">找技术合伙人是很多非技术创业者的痛点。本文分享几个实用的方法和注意事项，帮助你找到志同道合的技术伙伴...</p>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span>作者：小概率</span>
          <span>·</span>
          <span>阅读 1.2k</span>
          <span>·</span>
          <span>3天前</span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: '独立开发者学院 - 小概率',
  description: '独立开发者创业经验、技术分享、合伙指南，助力独立开发者成长',
  ogTitle: '独立开发者学院 - 小概率',
  ogDescription: '独立开发者创业经验、技术分享、合伙指南'
})
</script>

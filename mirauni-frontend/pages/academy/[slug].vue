<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <NuxtLink to="/academy" class="text-gray-500 hover:text-indie-text">← 返回学院</NuxtLink>
    </div>

    <article class="max-w-3xl mx-auto">
      <!-- 文章头部 -->
      <header class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <span class="px-3 py-1 bg-indie-accent text-white text-sm">创业经验</span>
        </div>
        <h1 class="text-4xl font-display font-bold mb-4">如何找到靠谱的技术合伙人？</h1>
        <div class="flex items-center gap-4 text-gray-500">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-indie-secondary border border-indie-border rounded-full flex items-center justify-center text-sm">
              👤
            </div>
            <span>小概率</span>
          </div>
          <span>·</span>
          <span>2024-12-25</span>
          <span>·</span>
          <span>阅读 1.2k</span>
        </div>
      </header>

      <!-- 文章内容 -->
      <div class="bg-white border-2 border-indie-border shadow-brutal p-8 mb-8">
        <div class="prose prose-lg max-w-none">
          <p>找技术合伙人是很多非技术创业者的痛点。本文分享几个实用的方法和注意事项，帮助你找到志同道合的技术伙伴。</p>
          
          <h2>1. 明确你需要什么样的合伙人</h2>
          <p>在开始找人之前，先想清楚以下问题：</p>
          <ul>
            <li>项目需要什么技术栈？</li>
            <li>是全职还是兼职？</li>
            <li>合作方式是股权还是薪酬？</li>
          </ul>

          <h2>2. 去哪里找？</h2>
          <p>推荐几个渠道：</p>
          <ul>
            <li>小概率平台（就是你现在看的这个）</li>
            <li>V2EX 合作版块</li>
            <li>即刻独立开发圈</li>
            <li>技术社群和活动</li>
          </ul>

          <h2>3. 如何判断是否靠谱？</h2>
          <p>建议先小范围合作，验证对方的能力和态度...</p>
        </div>
      </div>

      <!-- 相关文章 -->
      <section>
        <h3 class="text-xl font-bold mb-4">相关文章</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <NuxtLink to="/academy/article-2" class="bg-white border-2 border-indie-border p-4 hover:shadow-brutal transition-all">
            <h4 class="font-bold mb-2">技术合伙人的股权怎么分？</h4>
            <p class="text-sm text-gray-500">创业经验 · 阅读 856</p>
          </NuxtLink>
          <NuxtLink to="/academy/article-3" class="bg-white border-2 border-indie-border p-4 hover:shadow-brutal transition-all">
            <h4 class="font-bold mb-2">独立开发者如何找到第一个用户？</h4>
            <p class="text-sm text-gray-500">产品思考 · 阅读 1.5k</p>
          </NuxtLink>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug

useSeoMeta({
  title: '如何找到靠谱的技术合伙人？ - 独立开发者学院 | 小概率',
  description: '找技术合伙人是很多非技术创业者的痛点。本文分享几个实用的方法和注意事项...',
  ogTitle: '如何找到靠谱的技术合伙人？',
  ogDescription: '找技术合伙人是很多非技术创业者的痛点',
  ogType: 'article'
})
</script>

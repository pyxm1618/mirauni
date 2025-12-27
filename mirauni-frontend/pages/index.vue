<template>
  <div class="container mx-auto px-4 py-12">
    <header class="text-center mb-16">
      <h1 class="text-5xl md:text-7xl font-display font-bold mb-6">
        找到你的<span class="bg-indie-primary px-2">技术合伙人</span>
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
        独立开发者找合伙人的第一站。发布你的项目，找到志同道合的开发者，一起创造。
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
        <NuxtLink to="/projects" class="px-8 py-4 bg-indie-primary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-lg text-center">
          浏览项目
        </NuxtLink>
        <NuxtLink to="/developers" class="px-8 py-4 bg-white border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-lg text-center">
          找开发者
        </NuxtLink>
      </div>
    </header>

    <!-- 特色区块 -->
    <section class="grid md:grid-cols-3 gap-6 mb-16">
      <div class="bg-white border-2 border-indie-border shadow-brutal p-6">
        <div class="text-4xl mb-4">🚀</div>
        <h3 class="text-xl font-bold mb-2">发布项目</h3>
        <p class="text-gray-600">有想法？发布你的项目，招募技术合伙人一起实现</p>
      </div>
      <div class="bg-white border-2 border-indie-border shadow-brutal p-6">
        <div class="text-4xl mb-4">👥</div>
        <h3 class="text-xl font-bold mb-2">找到伙伴</h3>
        <p class="text-gray-600">浏览开发者人才库，找到技能匹配的合作伙伴</p>
      </div>
      <div class="bg-white border-2 border-indie-border shadow-brutal p-6">
        <div class="text-4xl mb-4">💬</div>
        <h3 class="text-xl font-bold mb-2">即时沟通</h3>
        <p class="text-gray-600">解锁联系方式后，通过站内信直接沟通</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: '小概率 - 独立开发者找合伙人的第一站',
  description: '帮助独立开发者发布项目、寻找技术合伙人，找到靠谱的创业伙伴',
  keywords: '独立开发者,技术合伙人,找合伙人,创业项目,程序员副业',
  ogTitle: '小概率 - 独立开发者找合伙人的第一站',
  ogDescription: '帮助独立开发者发布项目、寻找技术合伙人，找到靠谱的创业伙伴',
  ogType: 'website'
})

// 结构化数据 - Organization
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '小概率',
        url: 'https://mirauni.com',
        logo: 'https://mirauni.com/logo.png',
        description: '独立开发者找合伙人的第一站',
        sameAs: []
      })
    }
  ]
})

// 首页浏览埋点
const { trackPageView } = useTrack()
onMounted(() => {
  trackPageView('首页')
})
</script>

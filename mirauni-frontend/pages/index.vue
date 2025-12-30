<template>
  <div class="container mx-auto px-4 py-12">
    <header class="text-center mb-16 flex flex-col items-center">
      <!-- Badge -->
      <div class="inline-block bg-indie-primary border-2 border-indie-border px-3 py-1 text-sm font-bold mb-6 shadow-brutal transform -rotate-2">
        {{ $t('home.badge') }}
      </div>

      <h1 class="text-6xl md:text-8xl font-display font-bold mb-8 leading-tight">
        {{ $t('home.heroTitlePrefix') }}<br>
        <span class="text-indie-secondary text-transparent bg-clip-text" style="-webkit-text-stroke: 2px #000;">{{ $t('home.heroTitleSuffix') }}</span>
      </h1>
      
      <!-- Boxed Subtext -->
      <div class="bg-white border-2 border-indie-border shadow-brutal p-6 max-w-2xl mx-auto mb-10 transform rotate-1">
        <p class="text-xl text-indie-text font-bold">
          {{ $t('home.heroSubtitle') }}
        </p>
      </div>

      <div class="flex flex-col sm:flex-row justify-center gap-6">
        <NuxtLink to="/projects" class="px-8 py-4 bg-indie-primary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-bold text-lg text-center uppercase tracking-wide">
          {{ $t('home.startProject') }}
        </NuxtLink>
        <NuxtLink to="/developers" class="px-8 py-4 bg-indie-secondary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-bold text-lg text-center uppercase tracking-wide">
          {{ $t('home.findPartner') }}
        </NuxtLink>
      </div>
    </header>

    <!-- 特色区块 -->
    <section class="grid md:grid-cols-3 gap-6 mb-16">
      <div class="bg-white border-2 border-indie-border shadow-brutal p-6">
        <UIcon name="i-heroicons-rocket-launch-solid" class="w-10 h-10 mb-4" />
        <h3 class="text-xl font-bold mb-2">{{ $t('home.features.post.title') }}</h3>
        <p class="text-gray-600">{{ $t('home.features.post.desc') }}</p>
      </div>
      <div class="bg-white border-2 border-indie-border shadow-brutal p-6">
        <UIcon name="i-heroicons-users-solid" class="w-10 h-10 mb-4" />
        <h3 class="text-xl font-bold mb-2">{{ $t('home.features.find.title') }}</h3>
        <p class="text-gray-600">{{ $t('home.features.find.desc') }}</p>
      </div>
      <div class="bg-white border-2 border-indie-border shadow-brutal p-6">
        <UIcon name="i-heroicons-chat-bubble-left-right-solid" class="w-10 h-10 mb-4" />
        <h3 class="text-xl font-bold mb-2">{{ $t('home.features.chat.title') }}</h3>
        <p class="text-gray-600">{{ $t('home.features.chat.desc') }}</p>
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

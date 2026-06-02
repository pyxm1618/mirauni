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
        <NuxtLink to="/academy" class="px-8 py-4 bg-indie-secondary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-bold text-lg text-center uppercase tracking-wide">
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

    <section class="mb-16 bg-white border-2 border-indie-border shadow-brutal p-8">
      <h2 class="text-3xl md:text-4xl font-black mb-6">为什么要先找技术合伙人？</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="border-2 border-black p-5">
          <h3 class="text-xl font-black mb-2">更快验证方向</h3>
          <p class="font-bold text-gray-700">技术合伙人一起参与产品设计，能更早发现需求和实现风险，避免做完才返工。</p>
        </div>
        <div class="border-2 border-black p-5">
          <h3 class="text-xl font-black mb-2">更稳交付节奏</h3>
          <p class="font-bold text-gray-700">从原型到上线再到迭代，团队协作效率更高，项目不容易卡在单点依赖。</p>
        </div>
        <div class="border-2 border-black p-5">
          <h3 class="text-xl font-black mb-2">更清晰合作方式</h3>
          <p class="font-bold text-gray-700">平台支持股权、分成、薪酬等多种模式，帮助你在早期就把合作规则讲清楚。</p>
        </div>
      </div>
    </section>

    <section class="mb-16 bg-indie-secondary/20 border-2 border-indie-border shadow-brutal p-8">
      <h2 class="text-3xl md:text-4xl font-black mb-6">如何发布项目招募开发者？</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white border-2 border-black p-5">
          <p class="text-sm font-black mb-2">STEP 1</p>
          <h3 class="text-xl font-black mb-2">写清项目目标</h3>
          <p class="font-bold text-gray-700">说明你要解决什么问题，目标用户是谁，当前项目阶段到哪里。</p>
        </div>
        <div class="bg-white border-2 border-black p-5">
          <p class="text-sm font-black mb-2">STEP 2</p>
          <h3 class="text-xl font-black mb-2">明确招募角色</h3>
          <p class="font-bold text-gray-700">标明需要前端、后端、全栈或 Flutter 开发者，并写出关键技能要求。</p>
        </div>
        <div class="bg-white border-2 border-black p-5">
          <p class="text-sm font-black mb-2">STEP 3</p>
          <h3 class="text-xl font-black mb-2">设置合作方式</h3>
          <p class="font-bold text-gray-700">选择股权、分成或薪酬方案，减少沟通成本，快速进入合作试跑阶段。</p>
        </div>
      </div>
    </section>

    <section class="mb-16 bg-white border-2 border-indie-border shadow-brutal p-8">
      <h2 class="text-3xl md:text-4xl font-black mb-6">这个平台适合哪些项目方？</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="border-2 border-black p-5">
          <h3 class="text-xl font-black mb-2">0-1 创业项目</h3>
          <p class="font-bold text-gray-700">有清晰方向但缺研发搭档，想尽快验证市场的发起人。</p>
        </div>
        <div class="border-2 border-black p-5">
          <h3 class="text-xl font-black mb-2">AI / SaaS / App 团队</h3>
          <p class="font-bold text-gray-700">已完成原型或首版 MVP，准备进入稳定迭代和商业化阶段的团队。</p>
        </div>
      </div>
    </section>

    <section class="mb-16 bg-white border-2 border-indie-border shadow-brutal p-8">
      <h2 class="text-3xl md:text-4xl font-black mb-6">常见问题（FAQ）</h2>
      <div class="space-y-4">
        <details class="border-2 border-black p-4">
          <summary class="font-black cursor-pointer">没有技术背景，也可以发布项目吗？</summary>
          <p class="font-bold text-gray-700 mt-3">可以。建议把行业认知、用户问题和目标拆解清楚，再明确希望合作的技术角色。</p>
        </details>
        <details class="border-2 border-black p-4">
          <summary class="font-black cursor-pointer">如何提高招募技术合伙人的成功率？</summary>
          <p class="font-bold text-gray-700 mt-3">把项目背景、阶段、合作方式和预期产出写具体，越具体越容易吸引匹配开发者。</p>
        </details>
        <details class="border-2 border-black p-4">
          <summary class="font-black cursor-pointer">平台是否支持远程合作？</summary>
          <p class="font-bold text-gray-700 mt-3">支持。发布项目时可选择远程、坐班或混合模式，帮助你匹配不同合作偏好的开发者。</p>
        </details>
      </div>
    </section>

    <section class="mb-8 bg-black text-white border-2 border-black shadow-brutal p-8">
      <h2 class="text-3xl md:text-4xl font-black mb-4">平台信息</h2>
      <p class="font-bold mb-2">站点：mirauni.com</p>
      <p class="font-bold mb-2">备案：京ICP备2024069371号-6</p>
      <p class="font-bold">联系：contact@mirauni.com</p>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => `${t('common.appName')} - 找技术合伙人｜创业项目招募开发者平台`,
  description: () => '小概率是找技术合伙人和招募开发者的平台。发布创业项目，快速匹配前端、后端、全栈与 Flutter 技术合伙人。',
  keywords: () => '找技术合伙人,招募技术合伙人,创业项目招募开发者,找程序员合伙做项目,创业找技术合伙人',
  ogTitle: () => `${t('common.appName')} - 找技术合伙人平台`,
  ogDescription: () => '发布项目，招募开发者，快速找到靠谱技术合伙人。',
  ogType: 'website'
})

useCanonical('/')

// 结构化数据 - Organization
const jsonLd = computed(() => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: t('common.appName'),
  url: 'https://mirauni.com',
  logo: 'https://mirauni.com/logo.png',
  description: t('home.subtitle'),
  sameAs: []
}))

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: jsonLd
    }
  ]
})

// 首页浏览埋点
const { trackPageView } = useTrack()
onMounted(() => {
  trackPageView('首页')
})
</script>

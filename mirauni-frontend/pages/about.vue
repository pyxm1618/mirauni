<template>
  <div class="bg-indie-bg min-h-screen pb-20">
    <!-- 页头 -->
    <div class="bg-white border-b-4 border-black mb-12">
      <div class="container mx-auto px-4 py-16">
        <div class="max-w-4xl">
          <div class="inline-block bg-indie-primary text-black px-4 py-1 font-black mb-4 uppercase text-sm transform -rotate-1">
            {{ $t('about.badge') }}
          </div>
          <h1 class="text-5xl md:text-7xl font-black font-display mb-8 uppercase tracking-tighter leading-none">
            {{ $t('about.title') }}
          </h1>
          <p class="text-2xl font-bold text-gray-800 max-w-2xl border-l-8 border-indie-secondary pl-6 py-2">
            {{ $t('about.slogan') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="container mx-auto px-4">
      <div class="max-w-4xl space-y-12">

        <!-- 我们是谁 -->
        <section class="bg-white border-3 border-black p-8 md:p-12 shadow-brutal">
          <h2 class="text-3xl font-black mb-6 uppercase">{{ $t('about.whoWeAre.title') }}</h2>
          <p class="text-lg leading-relaxed text-gray-700">
            {{ $t('about.whoWeAre.content') }}
          </p>
        </section>

        <!-- 使命与愿景 -->
        <div class="grid md:grid-cols-2 gap-8">
          <section class="bg-indie-primary border-3 border-black p-8 shadow-brutal">
            <h2 class="text-2xl font-black mb-4 uppercase">{{ $t('about.mission.title') }}</h2>
            <p class="text-lg leading-relaxed">
              {{ $t('about.mission.content') }}
            </p>
          </section>
          <section class="bg-indie-secondary border-3 border-black p-8 shadow-brutal">
            <h2 class="text-2xl font-black mb-4 uppercase">{{ $t('about.vision.title') }}</h2>
            <p class="text-lg leading-relaxed">
              {{ $t('about.vision.content') }}
            </p>
          </section>
        </div>

        <!-- 我们解决什么问题 -->
        <section class="bg-white border-3 border-black p-8 md:p-12 shadow-brutal">
          <h2 class="text-3xl font-black mb-6 uppercase">{{ $t('about.problem.title') }}</h2>
          <div class="space-y-6 text-lg text-gray-700">
            <p>{{ $t('about.problem.p1') }}</p>
            <p>{{ $t('about.problem.p2') }}</p>
          </div>
        </section>

        <!-- 为什么选择我们 -->
        <section class="bg-white border-3 border-black p-8 md:p-12 shadow-brutal">
          <h2 class="text-3xl font-black mb-8 uppercase">{{ $t('about.whyUs.title') }}</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center p-6 border-3 border-black bg-indie-bg">
              <div class="text-4xl mb-4">🎯</div>
              <h3 class="font-black text-lg mb-2 uppercase">{{ $t('about.whyUs.feature1.title') }}</h3>
              <p class="text-gray-600">{{ $t('about.whyUs.feature1.desc') }}</p>
            </div>
            <div class="text-center p-6 border-3 border-black bg-indie-bg">
              <div class="text-4xl mb-4">🤝</div>
              <h3 class="font-black text-lg mb-2 uppercase">{{ $t('about.whyUs.feature2.title') }}</h3>
              <p class="text-gray-600">{{ $t('about.whyUs.feature2.desc') }}</p>
            </div>
            <div class="text-center p-6 border-3 border-black bg-indie-bg">
              <div class="text-4xl mb-4">🚀</div>
              <h3 class="font-black text-lg mb-2 uppercase">{{ $t('about.whyUs.feature3.title') }}</h3>
              <p class="text-gray-600">{{ $t('about.whyUs.feature3.desc') }}</p>
            </div>
          </div>
        </section>

        <!-- 联系我们 -->
        <section class="bg-black text-white border-3 border-black p-8 md:p-12">
          <h2 class="text-3xl font-black mb-6 uppercase">{{ $t('about.contact.title') }}</h2>
          <div class="space-y-4 text-lg">
            <p>{{ $t('about.contact.intro') }}</p>
            <div class="flex flex-wrap gap-6 mt-6">
              <a href="mailto:contact@mirauni.com" class="inline-flex items-center gap-2 px-6 py-3 bg-indie-primary text-black font-black border-3 border-white shadow-brutal-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-white-hover transition-all">
                📧 contact@mirauni.com
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('about.seoTitle'),
  description: t('about.seoDescription'),
})
</script>

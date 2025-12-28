<template>
  <div class="bg-indie-bg min-h-screen pb-20">
    <!-- 页头 -->
    <div class="bg-white border-b-4 border-black mb-12">
      <div class="container mx-auto px-4 py-16">
        <div class="max-w-4xl">
          <div class="inline-block bg-black text-white px-4 py-1 font-black mb-4 uppercase text-sm transform -rotate-1">
            {{ $t('legal.badge') }}
          </div>
          <h1 class="text-5xl md:text-7xl font-black font-display mb-8 uppercase tracking-tighter leading-none">
            {{ $t('privacy.title') }}
          </h1>
          <p class="text-lg text-gray-600">
            {{ $t('privacy.lastUpdated') }}: 2025年1月1日
          </p>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="container mx-auto px-4">
      <div class="max-w-4xl bg-white border-3 border-black p-8 md:p-12 shadow-brutal">
        
        <!-- 引言 -->
        <section class="mb-10">
          <p class="text-lg leading-relaxed text-gray-700">
            {{ $t('privacy.intro') }}
          </p>
        </section>

        <!-- 第一条：信息收集 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-secondary pb-2">
            {{ $t('privacy.section1.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>{{ $t('privacy.section1.intro') }}</p>
            <h3 class="font-bold text-lg mt-6">{{ $t('privacy.section1.sub1.title') }}</h3>
            <ul class="list-disc pl-6 space-y-2">
              <li>{{ $t('privacy.section1.sub1.item1') }}</li>
              <li>{{ $t('privacy.section1.sub1.item2') }}</li>
              <li>{{ $t('privacy.section1.sub1.item3') }}</li>
            </ul>
            <h3 class="font-bold text-lg mt-6">{{ $t('privacy.section1.sub2.title') }}</h3>
            <ul class="list-disc pl-6 space-y-2">
              <li>{{ $t('privacy.section1.sub2.item1') }}</li>
              <li>{{ $t('privacy.section1.sub2.item2') }}</li>
              <li>{{ $t('privacy.section1.sub2.item3') }}</li>
            </ul>
          </div>
        </section>

        <!-- 第二条：信息使用 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-secondary pb-2">
            {{ $t('privacy.section2.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>{{ $t('privacy.section2.intro') }}</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>{{ $t('privacy.section2.use1') }}</li>
              <li>{{ $t('privacy.section2.use2') }}</li>
              <li>{{ $t('privacy.section2.use3') }}</li>
              <li>{{ $t('privacy.section2.use4') }}</li>
              <li>{{ $t('privacy.section2.use5') }}</li>
            </ul>
          </div>
        </section>

        <!-- 第三条：信息存储与保护 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-secondary pb-2">
            {{ $t('privacy.section3.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>3.1 {{ $t('privacy.section3.p1') }}</p>
            <p>3.2 {{ $t('privacy.section3.p2') }}</p>
            <p>3.3 {{ $t('privacy.section3.p3') }}</p>
          </div>
        </section>

        <!-- 第四条：信息共享 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-secondary pb-2">
            {{ $t('privacy.section4.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>{{ $t('privacy.section4.intro') }}</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>{{ $t('privacy.section4.case1') }}</li>
              <li>{{ $t('privacy.section4.case2') }}</li>
              <li>{{ $t('privacy.section4.case3') }}</li>
              <li>{{ $t('privacy.section4.case4') }}</li>
            </ul>
          </div>
        </section>

        <!-- 第五条：Cookie 使用 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-secondary pb-2">
            {{ $t('privacy.section5.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>5.1 {{ $t('privacy.section5.p1') }}</p>
            <p>5.2 {{ $t('privacy.section5.p2') }}</p>
          </div>
        </section>

        <!-- 第六条：用户权利 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-secondary pb-2">
            {{ $t('privacy.section6.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>{{ $t('privacy.section6.intro') }}</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>{{ $t('privacy.section6.right1') }}</li>
              <li>{{ $t('privacy.section6.right2') }}</li>
              <li>{{ $t('privacy.section6.right3') }}</li>
              <li>{{ $t('privacy.section6.right4') }}</li>
            </ul>
            <p>{{ $t('privacy.section6.contact') }}</p>
          </div>
        </section>

        <!-- 第七条：未成年人保护 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-secondary pb-2">
            {{ $t('privacy.section7.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>{{ $t('privacy.section7.p1') }}</p>
          </div>
        </section>

        <!-- 第八条：政策更新 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-secondary pb-2">
            {{ $t('privacy.section8.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>{{ $t('privacy.section8.p1') }}</p>
          </div>
        </section>

        <!-- 第九条：联系我们 -->
        <section class="mb-6">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-secondary pb-2">
            {{ $t('privacy.section9.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>{{ $t('privacy.section9.p1') }}</p>
            <p class="font-bold">{{ $t('common.email') }}: privacy@mirauni.com</p>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('privacy.seoTitle'),
  description: t('privacy.seoDescription'),
})
</script>

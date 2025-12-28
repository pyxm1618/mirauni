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
            {{ $t('terms.title') }}
          </h1>
          <p class="text-lg text-gray-600">
            {{ $t('terms.lastUpdated') }}: 2025年1月1日
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
            {{ $t('terms.intro') }}
          </p>
        </section>

        <!-- 第一条：服务说明 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-primary pb-2">
            {{ $t('terms.section1.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>1.1 {{ $t('terms.section1.p1') }}</p>
            <p>1.2 {{ $t('terms.section1.p2') }}</p>
            <p>1.3 {{ $t('terms.section1.p3') }}</p>
          </div>
        </section>

        <!-- 第二条：账户注册与安全 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-primary pb-2">
            {{ $t('terms.section2.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>2.1 {{ $t('terms.section2.p1') }}</p>
            <p>2.2 {{ $t('terms.section2.p2') }}</p>
            <p>2.3 {{ $t('terms.section2.p3') }}</p>
            <p>2.4 {{ $t('terms.section2.p4') }}</p>
          </div>
        </section>

        <!-- 第三条：用户行为规范 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-primary pb-2">
            {{ $t('terms.section3.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>{{ $t('terms.section3.intro') }}</p>
            <ul class="list-disc pl-6 space-y-2">
              <li>{{ $t('terms.section3.rule1') }}</li>
              <li>{{ $t('terms.section3.rule2') }}</li>
              <li>{{ $t('terms.section3.rule3') }}</li>
              <li>{{ $t('terms.section3.rule4') }}</li>
              <li>{{ $t('terms.section3.rule5') }}</li>
              <li>{{ $t('terms.section3.rule6') }}</li>
            </ul>
          </div>
        </section>

        <!-- 第四条：付费服务 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-primary pb-2">
            {{ $t('terms.section4.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>4.1 {{ $t('terms.section4.p1') }}</p>
            <p>4.2 {{ $t('terms.section4.p2') }}</p>
            <p>4.3 {{ $t('terms.section4.p3') }}</p>
            <p>4.4 {{ $t('terms.section4.p4') }}</p>
          </div>
        </section>

        <!-- 第五条：内容发布规则 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-primary pb-2">
            {{ $t('terms.section5.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>5.1 {{ $t('terms.section5.p1') }}</p>
            <p>5.2 {{ $t('terms.section5.p2') }}</p>
            <p>5.3 {{ $t('terms.section5.p3') }}</p>
          </div>
        </section>

        <!-- 第六条：知识产权 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-primary pb-2">
            {{ $t('terms.section6.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>6.1 {{ $t('terms.section6.p1') }}</p>
            <p>6.2 {{ $t('terms.section6.p2') }}</p>
          </div>
        </section>

        <!-- 第七条：免责声明 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-primary pb-2">
            {{ $t('terms.section7.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>7.1 {{ $t('terms.section7.p1') }}</p>
            <p>7.2 {{ $t('terms.section7.p2') }}</p>
            <p>7.3 {{ $t('terms.section7.p3') }}</p>
          </div>
        </section>

        <!-- 第八条：服务变更与终止 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-primary pb-2">
            {{ $t('terms.section8.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>8.1 {{ $t('terms.section8.p1') }}</p>
            <p>8.2 {{ $t('terms.section8.p2') }}</p>
          </div>
        </section>

        <!-- 第九条：法律适用与争议解决 -->
        <section class="mb-10">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-primary pb-2">
            {{ $t('terms.section9.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>9.1 {{ $t('terms.section9.p1') }}</p>
            <p>9.2 {{ $t('terms.section9.p2') }}</p>
          </div>
        </section>

        <!-- 第十条：联系方式 -->
        <section class="mb-6">
          <h2 class="text-2xl font-black mb-4 uppercase border-b-4 border-indie-primary pb-2">
            {{ $t('terms.section10.title') }}
          </h2>
          <div class="space-y-4 text-gray-700 leading-relaxed">
            <p>{{ $t('terms.section10.p1') }}</p>
            <p class="font-bold">{{ $t('common.email') }}: contact@mirauni.com</p>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('terms.seoTitle'),
  description: t('terms.seoDescription'),
})
</script>

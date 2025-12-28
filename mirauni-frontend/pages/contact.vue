<template>
  <div class="bg-indie-bg min-h-screen pb-20">
    <!-- 页头 -->
    <div class="bg-white border-b-4 border-black mb-12">
      <div class="container mx-auto px-4 py-16">
        <div class="max-w-4xl">
          <div class="inline-block bg-indie-secondary text-black px-4 py-1 font-black mb-4 uppercase text-sm transform -rotate-1">
            {{ $t('contact.badge') }}
          </div>
          <h1 class="text-5xl md:text-7xl font-black font-display mb-8 uppercase tracking-tighter leading-none">
            {{ $t('contact.title') }}
          </h1>
          <p class="text-xl text-gray-600">
            {{ $t('contact.subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="container mx-auto px-4">
      <div class="max-w-4xl">
        <div class="grid md:grid-cols-2 gap-8">
          
          <!-- 联系方式 -->
          <div class="space-y-6">
            <!-- 商务合作 -->
            <div class="bg-white border-3 border-black p-6 shadow-brutal">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-indie-primary border-3 border-black flex items-center justify-center text-2xl">
                  💼
                </div>
                <h3 class="text-xl font-black uppercase">{{ $t('contact.business.title') }}</h3>
              </div>
              <p class="text-gray-600 mb-4">{{ $t('contact.business.desc') }}</p>
              <a href="mailto:business@mirauni.com" class="font-bold text-lg hover:underline">
                business@mirauni.com
              </a>
            </div>

            <!-- 用户反馈 -->
            <div class="bg-white border-3 border-black p-6 shadow-brutal">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-indie-secondary border-3 border-black flex items-center justify-center text-2xl">
                  💬
                </div>
                <h3 class="text-xl font-black uppercase">{{ $t('contact.feedback.title') }}</h3>
              </div>
              <p class="text-gray-600 mb-4">{{ $t('contact.feedback.desc') }}</p>
              <a href="mailto:feedback@mirauni.com" class="font-bold text-lg hover:underline">
                feedback@mirauni.com
              </a>
            </div>

            <!-- 媒体咨询 -->
            <div class="bg-white border-3 border-black p-6 shadow-brutal">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-white border-3 border-black flex items-center justify-center text-2xl">
                  📰
                </div>
                <h3 class="text-xl font-black uppercase">{{ $t('contact.media.title') }}</h3>
              </div>
              <p class="text-gray-600 mb-4">{{ $t('contact.media.desc') }}</p>
              <a href="mailto:media@mirauni.com" class="font-bold text-lg hover:underline">
                media@mirauni.com
              </a>
            </div>
          </div>

          <!-- 社交媒体 -->
          <div class="bg-black text-white border-3 border-black p-8">
            <h2 class="text-2xl font-black mb-6 uppercase">{{ $t('contact.social.title') }}</h2>
            <p class="text-gray-300 mb-8">{{ $t('contact.social.desc') }}</p>
            
            <div class="space-y-4">
              <!-- 微信公众号 -->
              <div class="flex items-center gap-4 p-4 bg-white/10 border-2 border-white/20 rounded">
                <span class="text-2xl">📱</span>
                <div>
                  <div class="font-bold">{{ $t('contact.social.wechat') }}</div>
                  <div class="text-gray-400 text-sm">{{ $t('contact.social.wechatId') }}: 小概率</div>
                </div>
              </div>

              <!-- Twitter / X -->
              <a href="https://twitter.com/mirauni" target="_blank" class="flex items-center gap-4 p-4 bg-white/10 border-2 border-white/20 rounded hover:bg-white/20 transition-colors">
                <span class="text-2xl">𝕏</span>
                <div>
                  <div class="font-bold">Twitter / X</div>
                  <div class="text-gray-400 text-sm">@mirauni</div>
                </div>
              </a>

              <!-- 即刻 -->
              <div class="flex items-center gap-4 p-4 bg-white/10 border-2 border-white/20 rounded">
                <span class="text-2xl">⚡</span>
                <div>
                  <div class="font-bold">{{ $t('contact.social.jike') }}</div>
                  <div class="text-gray-400 text-sm">{{ $t('contact.social.jikeId') }}: 小概率</div>
                </div>
              </div>
            </div>

            <!-- 工作时间 -->
            <div class="mt-8 pt-6 border-t border-white/20">
              <h3 class="font-bold mb-2">{{ $t('contact.workHours.title') }}</h3>
              <p class="text-gray-400">{{ $t('contact.workHours.time') }}</p>
              <p class="text-gray-400 text-sm mt-2">{{ $t('contact.workHours.note') }}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: t('contact.seoTitle'),
  description: t('contact.seoDescription'),
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-display font-bold mb-8">我的项目</h1>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- 侧边栏 -->
      <aside class="lg:col-span-1">
        <nav class="bg-white border-2 border-indie-border shadow-brutal">
          <NuxtLink to="/me" class="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
            个人资料
          </NuxtLink>
          <NuxtLink to="/me/projects" class="block px-6 py-4 border-b border-gray-200 font-bold bg-indie-primary">
            我的项目
          </NuxtLink>
          <NuxtLink to="/me/messages" class="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
            站内信
          </NuxtLink>
          <NuxtLink to="/me/recharge" class="block px-6 py-4 hover:bg-gray-50">
            充值
          </NuxtLink>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="lg:col-span-3">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">项目列表</h2>
          <button class="px-6 py-3 bg-indie-primary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover transition-all font-bold">
            + 发布新项目
          </button>
        </div>

        <!-- 项目列表 -->
        <div class="space-y-4">
          <div v-for="i in 3" :key="i" class="bg-white border-2 border-indie-border shadow-brutal p-6">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="px-2 py-1 text-sm" :class="i === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                    {{ i === 1 ? '招募中' : (i === 2 ? '待审核' : '已关闭') }}
                  </span>
                  <span class="px-2 py-1 bg-indie-secondary text-sm">SaaS 工具</span>
                </div>
                <h3 class="text-xl font-bold mb-2">我的项目名称 {{ i }}</h3>
                <p class="text-gray-600 mb-3">项目的一句话简介...</p>
                <div class="text-sm text-gray-500">
                  浏览 128 · 发布于 3天前
                </div>
              </div>
              <div class="flex gap-2 ml-4">
                <button class="px-4 py-2 border-2 border-indie-border hover:bg-gray-50">
                  编辑
                </button>
                <button class="px-4 py-2 border-2 border-indie-border hover:bg-gray-50 text-red-500">
                  {{ i === 3 ? '删除' : '下架' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 无项目时 -->
        <div v-if="false" class="bg-white border-2 border-indie-border shadow-brutal p-12 text-center">
          <div class="text-6xl mb-4">📝</div>
          <p class="text-gray-500 mb-4">你还没有发布任何项目</p>
          <button class="px-6 py-3 bg-indie-primary border-2 border-indie-border shadow-brutal font-bold">
            发布第一个项目
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: '我的项目 - 小概率',
  robots: 'noindex'
})
</script>

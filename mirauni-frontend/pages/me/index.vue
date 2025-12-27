<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-display font-bold mb-8">个人中心</h1>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- 侧边栏 -->
      <aside class="lg:col-span-1">
        <nav class="bg-white border-2 border-indie-border shadow-brutal">
          <NuxtLink to="/me" class="block px-6 py-4 border-b border-gray-200 font-bold bg-indie-primary">
            个人资料
          </NuxtLink>
          <NuxtLink to="/me/projects" class="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
            我的项目
          </NuxtLink>
          <NuxtLink to="/me/messages" class="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
            站内信
            <span class="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">3</span>
          </NuxtLink>
          <NuxtLink to="/me/recharge" class="block px-6 py-4 hover:bg-gray-50">
            充值
          </NuxtLink>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="lg:col-span-3">
        <div class="bg-white border-2 border-indie-border shadow-brutal p-8">
          <h2 class="text-2xl font-bold mb-6">个人资料</h2>
          
          <form class="space-y-6">
            <!-- 头像 -->
            <div>
              <label class="block text-sm font-bold mb-2">头像</label>
              <div class="flex items-center gap-4">
                <div class="w-20 h-20 bg-indie-secondary border-2 border-indie-border rounded-full flex items-center justify-center text-3xl">
                  👤
                </div>
                <button type="button" class="px-4 py-2 border-2 border-indie-border hover:bg-gray-50">
                  上传头像
                </button>
              </div>
            </div>

            <!-- 用户名 -->
            <div>
              <label class="block text-sm font-bold mb-2">用户名</label>
              <input type="text" class="w-full px-4 py-3 border-2 border-indie-border" placeholder="设置唯一用户名" />
              <p class="text-sm text-gray-500 mt-1">用于个人主页 URL：mirauni.com/developer/用户名</p>
            </div>

            <!-- 简介 -->
            <div>
              <label class="block text-sm font-bold mb-2">个人简介</label>
              <textarea rows="3" class="w-full px-4 py-3 border-2 border-indie-border" placeholder="介绍一下你自己..."></textarea>
            </div>

            <!-- 技能 -->
            <div>
              <label class="block text-sm font-bold mb-2">技能标签</label>
              <div class="flex flex-wrap gap-2 mb-2">
                <span class="px-3 py-1 bg-indie-primary border border-indie-border flex items-center gap-2">
                  Vue.js <button type="button" class="text-gray-500 hover:text-red-500">×</button>
                </span>
                <span class="px-3 py-1 bg-indie-primary border border-indie-border flex items-center gap-2">
                  Node.js <button type="button" class="text-gray-500 hover:text-red-500">×</button>
                </span>
              </div>
              <select class="px-4 py-2 border-2 border-indie-border bg-white">
                <option value="">+ 添加技能</option>
                <option value="vue">Vue.js</option>
                <option value="react">React</option>
                <option value="typescript">TypeScript</option>
                <option value="nodejs">Node.js</option>
                <option value="python">Python</option>
              </select>
            </div>

            <!-- 联系方式（付费可见） -->
            <div class="pt-6 border-t border-gray-200">
              <h3 class="text-lg font-bold mb-4">联系方式（付费用户可见）</h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold mb-2">微信号</label>
                  <input type="text" class="w-full px-4 py-3 border-2 border-indie-border" placeholder="你的微信号" />
                </div>
                <div>
                  <label class="block text-sm font-bold mb-2">邮箱</label>
                  <input type="email" class="w-full px-4 py-3 border-2 border-indie-border" placeholder="你的邮箱" />
                </div>
              </div>
            </div>

            <button type="submit" class="px-8 py-3 bg-indie-primary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover transition-all font-bold">
              保存资料
            </button>
          </form>
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
  title: '个人中心 - 小概率',
  robots: 'noindex'
})
</script>

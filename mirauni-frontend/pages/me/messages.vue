<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-display font-bold mb-8">站内信</h1>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- 侧边栏 -->
      <aside class="lg:col-span-1">
        <nav class="bg-white border-2 border-indie-border shadow-brutal">
          <NuxtLink to="/me" class="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
            个人资料
          </NuxtLink>
          <NuxtLink to="/me/projects" class="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
            我的项目
          </NuxtLink>
          <NuxtLink to="/me/messages" class="block px-6 py-4 border-b border-gray-200 font-bold bg-indie-primary">
            站内信
          </NuxtLink>
          <NuxtLink to="/me/recharge" class="block px-6 py-4 hover:bg-gray-50">
            充值
          </NuxtLink>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="lg:col-span-3">
        <div class="grid md:grid-cols-3 gap-0 h-[600px] bg-white border-2 border-indie-border shadow-brutal overflow-hidden">
          <!-- 会话列表 -->
          <div class="md:col-span-1 border-r border-gray-200 overflow-y-auto">
            <div v-for="i in 5" :key="i" class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" :class="i === 1 ? 'bg-indie-primary/20' : ''">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-indie-secondary border border-indie-border rounded-full flex items-center justify-center flex-shrink-0">
                  👤
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-bold truncate">用户昵称</span>
                    <span class="text-xs text-gray-400">昨天</span>
                  </div>
                  <p class="text-sm text-gray-500 truncate">最后一条消息内容...</p>
                </div>
                <div v-if="i <= 2" class="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
              </div>
            </div>
          </div>

          <!-- 聊天区域 -->
          <div class="md:col-span-2 flex flex-col">
            <!-- 聊天头部 -->
            <div class="p-4 border-b border-gray-200 font-bold">
              与 用户昵称 的对话
            </div>

            <!-- 消息列表 -->
            <div class="flex-1 p-4 overflow-y-auto space-y-4">
              <div class="flex gap-3">
                <div class="w-8 h-8 bg-indie-secondary border border-indie-border rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  👤
                </div>
                <div class="bg-gray-100 rounded-lg px-4 py-2 max-w-[70%]">
                  <p>你好，我对你的项目很感兴趣，可以聊聊吗？</p>
                  <span class="text-xs text-gray-400">10:30</span>
                </div>
              </div>

              <div class="flex gap-3 justify-end">
                <div class="bg-indie-primary rounded-lg px-4 py-2 max-w-[70%]">
                  <p>当然可以！你有什么想了解的？</p>
                  <span class="text-xs text-gray-500">10:32</span>
                </div>
              </div>
            </div>

            <!-- 输入框 -->
            <div class="p-4 border-t border-gray-200">
              <div class="flex gap-2">
                <input 
                  type="text" 
                  placeholder="输入消息..."
                  class="flex-1 px-4 py-2 border-2 border-indie-border"
                />
                <button class="px-6 py-2 bg-indie-primary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover transition-all font-bold">
                  发送
                </button>
              </div>
            </div>
          </div>
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
  title: '站内信 - 小概率',
  robots: 'noindex'
})
</script>

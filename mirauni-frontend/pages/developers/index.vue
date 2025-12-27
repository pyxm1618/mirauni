<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-display font-bold mb-8">开发者人才库</h1>
    
    <!-- 筛选栏 -->
    <div class="bg-white border-2 border-indie-border shadow-brutal p-4 mb-8">
      <div class="flex flex-wrap gap-4">
        <select class="px-4 py-2 border-2 border-indie-border bg-white">
          <option value="">全部技能</option>
          <option value="vue">Vue.js</option>
          <option value="react">React</option>
          <option value="typescript">TypeScript</option>
          <option value="flutter">Flutter</option>
          <option value="nodejs">Node.js</option>
          <option value="python">Python</option>
          <option value="golang">Go</option>
          <option value="ai">AI/ML</option>
        </select>
        <select class="px-4 py-2 border-2 border-indie-border bg-white">
          <option value="">工作偏好</option>
          <option value="fulltime">全职</option>
          <option value="parttime">兼职</option>
        </select>
        <input 
          type="text" 
          placeholder="搜索开发者..."
          class="flex-1 min-w-[200px] px-4 py-2 border-2 border-indie-border"
        />
      </div>
    </div>

    <!-- 开发者列表占位 -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white border-2 border-indie-border shadow-brutal p-6 hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 bg-indie-secondary border-2 border-indie-border rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h3 class="text-xl font-bold">开发者昵称</h3>
            <p class="text-gray-500">全栈开发 · 5年经验</p>
          </div>
        </div>
        <p class="text-gray-600 mb-4 line-clamp-2">热爱独立开发，擅长前后端开发，正在寻找有趣的项目...</p>
        <div class="flex flex-wrap gap-2">
          <span class="px-2 py-1 bg-gray-100 text-sm border border-gray-300">Vue.js</span>
          <span class="px-2 py-1 bg-gray-100 text-sm border border-gray-300">Node.js</span>
          <span class="px-2 py-1 bg-gray-100 text-sm border border-gray-300">PostgreSQL</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: '开发者人才库 - 小概率',
  description: '浏览独立开发者人才库，找到技能匹配的技术合伙人',
  ogTitle: '开发者人才库 - 小概率',
  ogDescription: '浏览独立开发者人才库，找到技能匹配的技术合伙人'
})
</script>

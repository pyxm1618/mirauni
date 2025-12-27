<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-4xl font-display font-bold mb-4">{{ categoryLabel }} 项目</h1>
      <p class="text-gray-600">浏览所有 {{ categoryLabel }} 类别的创业项目</p>
    </div>

    <!-- 项目列表 -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink 
        v-for="i in 9" 
        :key="i" 
        to="/projects/detail/1"
        class="bg-white border-2 border-indie-border shadow-brutal p-6 hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2 py-1 bg-indie-secondary text-sm border border-indie-border">{{ categoryLabel }}</span>
        </div>
        <h3 class="text-xl font-bold mb-2">项目名称占位</h3>
        <p class="text-gray-600 mb-4 line-clamp-2">这是项目的一句话简介...</p>
        <div class="text-sm text-gray-500">股权合作 · 发布于 2天前</div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const category = route.params.category as string

const categoryMap: Record<string, string> = {
  'saas': 'SaaS 工具',
  'app': '移动应用',
  'game': '游戏',
  'ai': 'AI / 人工智能',
  'ecommerce': '电商',
  'content': '内容/社区',
  'hardware': '智能硬件',
  'other': '其他'
}

const categoryLabel = computed(() => categoryMap[category] || category)

useSeoMeta({
  title: () => `${categoryLabel.value} 项目 - 小概率`,
  description: () => `浏览所有 ${categoryLabel.value} 类别的创业项目，找到感兴趣的项目加入`,
  ogTitle: () => `${categoryLabel.value} 项目 - 小概率`
})
</script>

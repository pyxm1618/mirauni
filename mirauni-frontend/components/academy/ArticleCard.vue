<template>
  <NuxtLink :to="'/academy/' + article.slug" class="group block bg-white border-2 border-transparent hover:border-black hover:shadow-brutal transition-all duration-300 rounded-xl overflow-hidden ring-1 ring-gray-100 hover:ring-0">
    <!-- Cover Image -->
    <div class="aspect-video bg-gray-100 overflow-hidden relative">
      <img 
        v-if="article.cover_url" 
        :src="article.cover_url" 
        :alt="article.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
        <span class="text-4xl opacity-50">📚</span>
      </div>
      <div v-if="article.category" class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 text-xs font-bold rounded-md shadow-sm">
        {{ categoryLabel(article.category) }}
      </div>
    </div>
    
    <!-- Content -->
    <div class="p-5">
      <h3 class="text-xl font-bold mb-2 group-hover:text-indie-primary transition-colors line-clamp-2 leading-tight">
        {{ article.title }}
      </h3>
      <p class="text-gray-500 text-sm line-clamp-2 mb-4 h-10 leading-relaxed">
        {{ article.summary || '暂无简介' }}
      </p>
      
      <div class="flex items-center justify-between text-xs text-gray-400 border-t pt-3">
        <div class="flex items-center gap-2">
            <span v-if="article.author?.username" class="font-medium text-gray-600">@{{ article.author.username }}</span>
            <span>{{ formatDate(article.created_at) }}</span>
        </div>
        <div class="flex items-center gap-1">
            <span>👁️ {{ article.view_count || 0 }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  article: any 
}>()

const categoryLabel = (val: string) => {
  const map: Record<string, string> = {
    'saas': 'SaaS',
    'app': 'App',
    'game': '游戏',
    'ai': 'AI',
    'ecommerce': '电商',
    'content': '内容',
    'hardware': '硬件',
    'other': '其他'
  }
  return map[val] || val
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

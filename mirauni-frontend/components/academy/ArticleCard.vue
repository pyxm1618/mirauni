<template>
  <NuxtLink :to="'/academy/' + article.slug" class="group block bg-white border-3 border-black shadow-brutal hover:shadow-brutal-hover hover:-translate-y-1 transition-all duration-300 relative">
    <!-- Cover Image -->
    <div class="aspect-video bg-gray-100 overflow-hidden relative border-b-3 border-black">
      <img 
        v-if="article.cover_url" 
        :src="article.cover_url" 
        :alt="article.title"
        class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-300 bg-indie-bg pattern-grid">
        <span class="text-4xl opacity-50 font-black">ACADEMY</span>
      </div>
      <div v-if="article.category" class="absolute top-0 right-0 bg-black text-white px-3 py-1 text-sm font-black uppercase border-l-3 border-b-3 border-black">
        {{ categoryLabel(article.category) }}
      </div>
    </div>
    
    <!-- Content -->
    <div class="p-6">
      <h3 class="text-xl font-black mb-3 group-hover:underline decoration-4 decoration-indie-primary transition-all line-clamp-2 leading-tight uppercase">
        {{ article.title }}
      </h3>
      <p class="text-gray-600 font-bold text-sm line-clamp-3 mb-6 leading-relaxed font-mono">
        {{ article.summary || 'NO_SUMMARY' }}
      </p>
      
      <div class="flex items-center justify-between text-xs font-bold uppercase border-t-2 border-black pt-4">
        <div class="flex items-center gap-2">
            <span v-if="article.author?.username" class="bg-indie-secondary px-1 border border-black">@{{ article.author.username }}</span>
            <span>{{ formatDate(article.created_at) }}</span>
        </div>
        <div class="flex items-center gap-1">
            <span>READ MORE -></span>
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

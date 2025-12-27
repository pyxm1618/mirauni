<template>
  <div class="bg-[#fafafa] min-h-screen pb-20">
    <div class="bg-white border-b border-gray-100 mb-8">
        <div class="container mx-auto px-4 py-12">
            <h1 class="text-4xl md:text-5xl font-display font-bold mb-4">
                <span class="text-indie-primary">独立开发者</span> 学院
            </h1>
            <p class="text-xl text-gray-500 max-w-2xl">
                分享独立开发经验、技术干货和变现思考，助力你的产品从 0 到 1。
            </p>
        </div>
    </div>

    <div class="container mx-auto px-4">
      <!-- 筛选栏 -->
      <div class="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
         <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
             <button 
                v-for="cat in categories" 
                :key="cat.value"
                @click="filters.category = cat.value"
                class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2"
                :class="filters.category === cat.value ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'"
             >
                {{ cat.label }}
             </button>
         </div>
      </div>

      <!-- 列表 -->
      <div v-if="pending" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div v-for="i in 6" :key="i" class="bg-white rounded-xl h-80 animate-pulse border border-gray-100"></div>
      </div>

      <div v-else-if="articles.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ArticleCard v-for="article in articles" :key="article.slug" :article="article" />
      </div>

      <div v-else class="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
        <div class="text-6xl mb-4">🌵</div>
        <div class="text-xl text-gray-500">暂时没有相关文章</div>
        <button @click="filters.category = 'all'" class="text-indie-primary font-bold mt-2 hover:underline">
            查看全部
        </button>
      </div>
      
      <!-- 加载更多/分页 (简单版) -->
      <div v-if="meta.total > meta.pageSize" class="mt-12 flex justify-center">
        <div class="flex gap-2">
            <button 
                @click="filters.page--" 
                :disabled="filters.page <= 1"
                class="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
                上一页
            </button>
             <span class="px-4 py-2 text-gray-500">
                {{ filters.page }} / {{ Math.ceil(meta.total / meta.pageSize) }}
            </span>
            <button 
                @click="filters.page++" 
                :disabled="filters.page * meta.pageSize >= meta.total"
                class="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
                下一页
            </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import ArticleCard from '~/components/academy/ArticleCard.vue'

const categories = [
    { label: '全部', value: 'all' },
    { label: 'SaaS', value: 'saas' },
    { label: 'App开发', value: 'app' },
    { label: '独立游戏', value: 'game' },
    { label: 'AI应用', value: 'ai' },
    { label: '内容变现', value: 'content' },
    { label: '增长黑客', value: 'growth' }, // Extra category just in case
    { label: '其他', value: 'other' }
]

const filters = ref({
    category: 'all',
    page: 1,
    pageSize: 9
})

interface ArticleResponse {
    success: boolean
    data: any[]
    meta: {
        total: number
        page: number
        pageSize: number
    }
}

const { data, pending, refresh } = await useFetch<ArticleResponse>('/api/articles', {
    query: filters,
    watch: [() => filters.value.category, () => filters.value.page] // Watch specific props
})

const articles = computed(() => data.value?.data || [])
const meta = computed(() => data.value?.meta || { total: 0, page: 1, pageSize: 9 })

// Reset page when category changes
watch(() => filters.value.category, () => {
    filters.value.page = 1
})

useSeoMeta({
  title: '独立开发者学院 - 小概率',
  description: '独立开发者学习成长的知识库，提供SaaS、App开发、游戏制作、AI应用等方向的实战经验与教程。',
})
</script>

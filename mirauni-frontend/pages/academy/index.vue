<template>
  <div class="bg-indie-bg min-h-screen pb-20">
    <div class="bg-white border-b-4 border-black mb-12">
        <div class="container mx-auto px-4 py-16">
            <div class="max-w-4xl">
                <div class="inline-block bg-black text-white px-4 py-1 font-black mb-4 uppercase text-sm transform -rotate-1">LEARN & GROW</div>
                <h1 class="text-6xl md:text-8xl font-black font-display mb-8 uppercase tracking-tighter leading-none">
                    INDIE <span class="text-indie-primary text-stroke-black">ACADEMY</span>
                </h1>
                <p class="text-2xl font-bold text-gray-800 max-w-2xl border-l-8 border-indie-secondary pl-6 py-2 uppercase">
                    Resources, guides, and wisdom for independent developers sailing from 0 to 1.
                </p>
            </div>
        </div>
    </div>

    <div class="container mx-auto px-4">
      <!-- 筛选栏 -->
      <div class="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between border-b-2 border-black pb-8">
         <div class="flex gap-3 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto scrollbar-hide">
             <button 
                v-for="cat in categories" 
                :key="cat.value"
                @click="filters.category = cat.value"
                class="px-6 py-2 border-3 font-black whitespace-nowrap transition-all uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                :class="filters.category === cat.value ? 'bg-black text-white border-black' : 'bg-white text-black border-black'"
             >
                {{ cat.label }}
             </button>
         </div>
      </div>

      <!-- 列表 -->
      <div v-if="pending" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div v-for="i in 6" :key="i" class="bg-white h-96 border-3 border-black animate-pulse opacity-50"></div>
      </div>

      <div v-else-if="articles.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ArticleCard v-for="article in articles" :key="article.slug" :article="article" />
      </div>

      <div v-else class="text-center py-24 bg-white border-3 border-dashed border-gray-400">
        <div class="text-6xl mb-6 grayscale font-black">/</div>
        <div class="text-3xl font-black uppercase text-gray-400 mb-4">NO ARTICLES FOUND</div>
        <button @click="filters.category = 'all'" class="text-black font-bold uppercase underline hover:bg-black hover:text-white px-2 transition-colors">
            VIEW ALL CATEGORIES
        </button>
      </div>
      
      <!-- 加载更多/分页 (简单版) -->
      <div v-if="meta.total > meta.pageSize" class="mt-16 flex justify-center">
        <div class="flex gap-4">
            <button 
                @click="filters.page--" 
                :disabled="filters.page <= 1"
                class="px-6 py-3 bg-white border-3 border-black font-black uppercase hover:shadow-brutal hover:-translate-y-1 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
            >
                PREV PAGE
            </button>
             <span class="px-6 py-3 font-black text-xl border-3 border-black bg-indie-secondary shadow-brutal">
                {{ filters.page }} / {{ Math.ceil(meta.total / meta.pageSize) }}
            </span>
            <button 
                @click="filters.page++" 
                :disabled="filters.page * meta.pageSize >= meta.total"
                class="px-6 py-3 bg-white border-3 border-black font-black uppercase hover:shadow-brutal hover:-translate-y-1 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
            >
                NEXT PAGE
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

const { t } = useI18n()

useSeoMeta({
  title: () => `${t('nav.academy')} - ${t('common.appName')}`,
  description: 'Indie Developer Academy',
  keywords: 'indie hacker,startup,code,marketing',
})
</script>

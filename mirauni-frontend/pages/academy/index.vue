<template>
  <div class="bg-indie-bg min-h-screen pb-20">
    <div class="bg-white border-b-4 border-black mb-12">
        <div class="container mx-auto px-4 py-16">
            <div class="max-w-4xl">
                <div class="inline-block bg-black text-white px-4 py-1 font-black mb-4 text-sm transform -rotate-1">招募指南</div>
                <h1 class="text-5xl md:text-7xl font-black font-display mb-8 tracking-tight leading-tight">
                    技术合伙人招募学院
                </h1>
                <p class="text-2xl font-bold text-gray-800 max-w-2xl border-l-8 border-indie-secondary pl-6 py-2">
                    围绕“找技术合伙人、发布项目、招募开发者”沉淀可直接实操的模板与方法。
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
        <div class="text-3xl font-black text-gray-400 mb-4">暂无文章</div>
        <button @click="filters.category = 'all'" class="text-black font-bold uppercase underline hover:bg-black hover:text-white px-2 transition-colors">
            查看全部分类
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
                上一页
            </button>
             <span class="px-6 py-3 font-black text-xl border-3 border-black bg-indie-secondary shadow-brutal">
                {{ filters.page }} / {{ Math.ceil(meta.total / meta.pageSize) }}
            </span>
            <button 
                @click="filters.page++" 
                :disabled="filters.page * meta.pageSize >= meta.total"
                class="px-6 py-3 bg-white border-3 border-black font-black uppercase hover:shadow-brutal hover:-translate-y-1 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
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

const { t } = useI18n()

const resolveOgImage = useOgImageResolver()
const ogImage = resolveOgImage()

useSeoMeta({
  title: () => `技术合伙人招募学院 - ${t('common.appName')}`,
  description: '学习怎么找技术合伙人、如何发布项目招募开发者、如何设计合作方案与项目页文案。',
  keywords: '怎么找技术合伙人,如何招募技术合伙人,创业项目招募开发者,技术合伙人合作方式',
  ogTitle: () => `技术合伙人招募学院 - ${t('common.appName')}`,
  ogDescription: '学习怎么找技术合伙人、如何发布项目招募开发者、如何设计合作方案与项目页文案。',
  ogImage
})

useCanonical('/academy')
</script>

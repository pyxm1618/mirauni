<template>
  <div class="bg-white min-h-screen pb-20">
    <!-- Header / Nav -->
    <div class="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur z-50">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
            <NuxtLink to="/academy" class="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium">
                <UIcon name="i-heroicons-arrow-left" />
                <span>返回学院</span>
            </NuxtLink>
            <div class="flex items-center gap-4">
               <button class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <UIcon name="i-heroicons-share" class="w-5 h-5" />
               </button>
            </div>
        </div>
    </div>

    <div v-if="pending" class="container mx-auto px-4 py-12 max-w-4xl">
        <div class="h-8 bg-gray-100 rounded w-3/4 mb-4 animate-pulse"></div>
        <div class="h-4 bg-gray-100 rounded w-1/4 mb-8 animate-pulse"></div>
        <div class="h-64 bg-gray-100 rounded mb-8 animate-pulse"></div>
        <div class="space-y-4">
             <div class="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
             <div class="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
             <div class="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
        </div>
    </div>

    <div v-else-if="article" class="container mx-auto px-4 py-12 max-w-4xl">
        
        <!-- Meta Info -->
        <div class="mb-8 text-center">
             <div class="flex items-center justify-center gap-2 mb-4">
                 <span class="bg-black text-white px-3 py-1 text-xs font-bold rounded-full">
                     {{ categoryLabel(article.category) }}
                 </span>
                 <span class="text-gray-500 text-sm">{{ formatDate(article.created_at) }}</span>
             </div>
             <h1 class="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight">
                 {{ article.title }}
             </h1>
             <div class="flex items-center justify-center gap-2 text-gray-500">
                 <UAvatar v-if="article.author?.avatar_url" :src="article.author.avatar_url" size="xs" />
                 <span class="font-medium text-black">{{ article.author?.username || '小概率' }}</span>
                 <span class="text-gray-300">|</span>
                 <span>{{ article.view_count || 0 }} 阅读</span>
             </div>
        </div>

        <!-- Cover -->
        <div v-if="article.cover_url" class="mb-12 rounded-2xl overflow-hidden shadow-brutal border-2 border-black aspect-video relative group">
            <img :src="article.cover_url" :alt="article.title" class="w-full h-full object-cover" />
        </div>

        <!-- Content -->
        <!-- TODO: Add a markdown renderer here. For now using whitespace-pre-wrap -->
        <div class="prose prose-lg prose-slate max-w-none mx-auto font-serif">
             <div class="whitespace-pre-wrap leading-relaxed">{{ article.content }}</div>
        </div>

        <!-- Footer -->
        <div class="mt-20 pt-10 border-t border-gray-100 text-center">
             <p class="text-gray-400 text-sm mb-4">觉得有帮助？分享给更多朋友</p>
             <div class="flex justify-center gap-4">
                 <!-- Share buttons placeholders -->
                 <button class="bg-[#07c160] text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
                     <UIcon name="i-heroicons-chat-bubble-oval-left-ellipsis" />
                     微信分享
                 </button>
             </div>
        </div>

    </div>

    <div v-else class="text-center py-24">
        <h2 class="text-2xl font-bold mb-2">文章未找到</h2>
        <p class="text-gray-500 mb-6">可能已被删除或地址错误</p>
        <NuxtLink to="/academy" class="text-indie-primary underline">返回列表</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data, pending, error } = await useFetch<any>(`/api/articles/${slug}`)

const article = computed(() => data.value?.data)

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
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

useSeoMeta({
  title: () => article.value ? `${article.value.title} - 小概率学院` : '文章详情',
  description: () => article.value?.summary || article.value?.content?.slice(0, 150),
  keywords: () => article.value ? `独立开发者,${article.value.category},创业,技术` : '',
  ogTitle: () => article.value?.title,
  ogDescription: () => article.value?.summary,
  ogType: 'article'
})

// 结构化数据 - Article
const structuredData = computed(() => article.value ? JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.value.title,
  description: article.value.summary,
  image: article.value.cover_url,
  datePublished: article.value.created_at,
  dateModified: article.value.updated_at || article.value.created_at,
  author: {
    '@type': 'Person',
    name: article.value.author?.username || '小概率'
  },
  publisher: {
    '@type': 'Organization',
    name: '小概率',
    url: 'https://mirauni.com'
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `https://mirauni.com/academy/${slug}`
  }
}) : '{}')

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: structuredData
    }
  ]
})

// 页面浏览埋点
const { trackPageView } = useTrack()
onMounted(() => {
  if (article.value?.title) {
    trackPageView(`文章: ${article.value.title}`)
  }
})
</script>

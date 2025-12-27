<template>
  <div class="bg-indie-bg min-h-screen pb-20">
    <!-- Header / Nav -->
    <div class="border-b-4 border-black sticky top-0 bg-white z-50">
        <div class="container mx-auto px-4 h-20 flex items-center justify-between">
            <NuxtLink to="/academy" class="flex items-center gap-2 text-black hover:text-indie-primary transition-colors font-black uppercase">
                <UIcon name="i-heroicons-arrow-left" class="w-6 h-6" />
                <span>BACK_TO_ACADEMY</span>
            </NuxtLink>
            <div class="flex items-center gap-4">
               <button class="p-2 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none bg-white">
                  <UIcon name="i-heroicons-share" class="w-5 h-5" />
               </button>
            </div>
        </div>
    </div>

    <div v-if="pending" class="container mx-auto px-4 py-12 max-w-4xl">
        <div class="h-12 bg-white border-3 border-black mb-8 animate-pulse w-3/4"></div>
        <div class="h-96 bg-white border-3 border-black mb-8 animate-pulse"></div>
        <div class="space-y-4">
             <div class="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
             <div class="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
             <div class="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>
    </div>

    <div v-else-if="article" class="container mx-auto px-4 py-12 max-w-4xl">
        
        <!-- Meta Info -->
        <div class="mb-12 text-center">
             <div class="flex items-center justify-center gap-3 mb-6">
                 <span class="bg-black text-white px-4 py-1 font-black border-2 border-black uppercase text-sm shadow-[2px_2px_0px_0px_rgba(100,100,100,1)]">
                     {{ categoryLabel(article.category) }}
                 </span>
                 <span class="text-gray-600 font-bold uppercase border-l-2 border-black pl-3 text-sm">{{ formatDate(article.created_at) }}</span>
             </div>
             <h1 class="text-4xl md:text-6xl font-black font-display mb-8 leading-tight uppercase tracking-tight">
                 {{ article.title }}
             </h1>
             <div class="flex items-center justify-center gap-4 text-gray-500 font-bold uppercase text-sm border-t-2 border-b-2 border-black py-4 bg-white inline-block px-8 shadow-brutal">
                 <UAvatar v-if="article.author?.avatar_url" :src="article.author.avatar_url" size="xs" class="ring-2 ring-black" />
                 <span class="font-black text-black">@{{ article.author?.username || 'MIRAUNI' }}</span>
                 <span class="text-gray-300">|</span>
                 <span><UIcon name="i-heroicons-eye" /> {{ article.view_count || 0 }} VIEWS</span>
             </div>
        </div>

        <!-- Cover -->
        <div v-if="article.cover_url" class="mb-12 border-3 border-black shadow-brutal aspect-video relative group bg-black">
            <img :src="article.cover_url" :alt="article.title" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
        </div>

        <!-- Content -->
        <div class="prose prose-xl prose-slate max-w-none mx-auto font-serif bg-white border-3 border-black shadow-brutal p-8 md:p-12 mb-12">
             <div class="whitespace-pre-wrap leading-loose text-gray-900">{{ article.content }}</div>
        </div>

        <!-- Footer -->
        <div class="mt-20 pt-10 border-t-4 border-black text-center">
             <p class="text-black font-black uppercase mb-6 tracking-widest text-lg">SHARE THIS WISDOM</p>
             <div class="flex justify-center gap-6">
                 <button class="bg-[#07c160] text-white px-8 py-3 font-black flex items-center gap-3 hover:opacity-90 transition-all border-3 border-black shadow-brutal hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase">
                     <UIcon name="i-heroicons-chat-bubble-oval-left-ellipsis" class="w-6 h-6" />
                     SHARE ON WECHAT
                 </button>
             </div>
        </div>

    </div>

    <div v-else class="text-center py-24 border-3 border-dashed border-gray-400 m-8">
        <h2 class="text-3xl font-black uppercase mb-4 text-gray-400">ARTICLE NOT FOUND</h2>
        <NuxtLink to="/academy" class="text-black underline font-bold uppercase hover:bg-black hover:text-white px-2">BACK TO LIST</NuxtLink>
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

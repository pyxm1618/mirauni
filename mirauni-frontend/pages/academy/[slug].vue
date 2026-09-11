<template>
  <div class="bg-indie-bg min-h-screen pb-24">
    <div class="border-b-4 border-black sticky top-0 bg-white z-40">
      <div class="container mx-auto px-4 min-h-16 md:h-20 py-3 md:py-0 flex items-center justify-between gap-4">
        <NuxtLink
          to="/academy"
          class="flex items-center gap-2 text-black hover:bg-indie-primary transition-colors font-black px-2 py-1"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          <span>返回学院</span>
        </NuxtLink>
        <div class="flex items-center gap-3">
          <span v-if="shareState" class="hidden sm:inline text-xs font-black">{{ shareState }}</span>
          <button
            type="button"
            class="px-3 py-2 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none bg-white font-black text-sm"
            @click="shareArticle"
          >
            分享文章
          </button>
        </div>
      </div>
    </div>

    <div v-if="pending" class="container mx-auto px-4 py-14 max-w-5xl">
      <div class="h-8 bg-white border-3 border-black mb-6 animate-pulse w-40"></div>
      <div class="h-40 bg-white border-3 border-black mb-8 animate-pulse"></div>
      <div class="h-[700px] bg-white border-3 border-black animate-pulse"></div>
    </div>

    <main v-else-if="article" class="container mx-auto px-4 pt-12 md:pt-16 max-w-6xl">
      <header class="grid lg:grid-cols-[1fr_280px] gap-8 lg:gap-12 items-end mb-10 md:mb-14">
        <div>
          <div class="flex flex-wrap items-center gap-3 mb-6">
            <span class="bg-black text-white px-3 py-1 font-black border-2 border-black text-xs tracking-[0.16em] uppercase">
              {{ categoryInfo?.eyebrow || 'ACADEMY' }}
            </span>
            <span class="bg-indie-secondary px-3 py-1 font-black border-2 border-black text-sm">
              {{ article.series || categoryInfo?.label }}
            </span>
          </div>

          <h1 class="text-4xl md:text-6xl lg:text-7xl font-black font-display leading-[1.03] tracking-tight mb-7">
            {{ article.title }}
          </h1>
          <p class="text-xl md:text-2xl font-bold leading-relaxed text-gray-700 max-w-4xl">
            {{ article.summary }}
          </p>
        </div>

        <aside class="bg-indie-primary border-3 border-black shadow-brutal p-5 lg:rotate-1">
          <p class="text-xs font-black tracking-[0.2em] uppercase mb-4">READING NOTE</p>
          <p class="font-black text-lg leading-snug mb-5">
            文章里的收入、用户量等数据，只按来源能证明到的程度表述。创始人自报会明确标出来。
          </p>
          <div class="border-t-2 border-black pt-4 text-xs font-bold leading-relaxed">
            {{ article.sources?.length || 0 }} 个事实来源 · @{{ article.author?.username || '小概率编辑部' }}
          </div>
        </aside>
      </header>

      <div v-if="article.cover_url" class="mb-10 border-3 border-black shadow-brutal aspect-video bg-black overflow-hidden">
        <img
          :src="article.cover_url"
          :alt="article.title"
          width="1100"
          height="620"
          decoding="async"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-8 lg:gap-12 items-start">
        <article class="bg-white border-3 border-black shadow-brutal p-6 sm:p-8 md:p-12 lg:p-14">
          <template v-for="(block, index) in contentBlocks" :key="`${block.type}-${index}`">
            <h2
              v-if="block.type === 'h2'"
              class="text-3xl md:text-4xl font-black leading-tight mt-12 first:mt-0 mb-5 pt-7 border-t-3 border-black"
            >
              {{ block.text }}
            </h2>
            <h3 v-else-if="block.type === 'h3'" class="text-2xl md:text-3xl font-black leading-tight mt-10 mb-4">
              {{ block.text }}
            </h3>
            <blockquote
              v-else-if="block.type === 'quote'"
              class="my-8 border-l-8 border-black bg-indie-primary px-6 py-5 text-xl font-black leading-relaxed"
            >
              {{ block.text }}
            </blockquote>
            <ul v-else-if="block.type === 'ul'" class="my-6 space-y-3 text-lg leading-8 font-medium list-disc pl-7">
              <li v-for="item in block.items" :key="item">{{ item }}</li>
            </ul>
            <ol v-else-if="block.type === 'ol'" class="my-6 space-y-3 text-lg leading-8 font-medium list-decimal pl-7">
              <li v-for="item in block.items" :key="item">{{ item }}</li>
            </ol>
            <p v-else class="text-lg md:text-[19px] leading-8 md:leading-9 text-gray-900 font-medium mb-6">
              {{ block.text }}
            </p>
          </template>
        </article>

        <aside class="lg:sticky lg:top-28 space-y-6">
          <section class="bg-white border-3 border-black shadow-brutal p-5">
            <div class="text-xs font-black tracking-[0.2em] uppercase mb-4">FACT SOURCES</div>
            <h2 class="text-2xl font-black mb-5">事实来源</h2>
            <div v-if="article.sources?.length" class="space-y-5">
              <div v-for="(source, index) in article.sources" :key="source.url" class="border-t-2 border-black pt-4 first:border-t-0 first:pt-0">
                <div class="text-xs font-black mb-1">0{{ index + 1 }}</div>
                <a
                  :href="source.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-black underline decoration-2 underline-offset-2 hover:bg-indie-primary"
                >
                  {{ source.label }} ↗
                </a>
                <p v-if="source.note" class="text-xs font-bold text-gray-600 mt-2 leading-relaxed">{{ source.note }}</p>
              </div>
            </div>
            <p v-else class="font-bold text-gray-500 text-sm">这篇文章暂无外部来源列表。</p>
          </section>

          <NuxtLink
            to="/academy"
            class="block bg-indie-secondary border-3 border-black shadow-brutal p-5 font-black hover:-translate-y-1 hover:shadow-brutal-lg transition-all"
          >
            <span class="text-xs tracking-[0.18em] block mb-2">BACK TO INDEX</span>
            看更多小生意故事、产品拆解和实战方法 →
          </NuxtLink>
        </aside>
      </div>

      <section v-if="relatedArticles.length" class="mt-20">
        <div class="border-b-4 border-black pb-5 mb-8">
          <div class="text-xs font-black tracking-[0.22em] uppercase mb-2">KEEP READING</div>
          <h2 class="text-4xl md:text-5xl font-black">继续看这个方向</h2>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <ArticleCard
            v-for="(related, index) in relatedArticles"
            :key="related.slug"
            :article="related"
            :index="index"
          />
        </div>
      </section>
    </main>

    <div v-else class="container mx-auto px-4 py-24 max-w-4xl text-center">
      <div class="bg-white border-3 border-black border-dashed p-16">
        <h2 class="text-3xl font-black mb-5">这篇文章不存在</h2>
        <NuxtLink to="/academy" class="font-black underline hover:bg-black hover:text-white px-2">返回学院</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ArticleCard from '~/components/academy/ArticleCard.vue'
import { academyCategoryMap } from '~/data/academy-content'
import type { AcademyArticle } from '~/data/academy/types'

interface ArticleResponse {
  success: boolean
  data: AcademyArticle
}

interface ArticleListResponse {
  success: boolean
  data: AcademyArticle[]
  meta: {
    total: number
    page: number
    pageSize: number
  }
}

type ContentBlock =
  | { type: 'h2' | 'h3' | 'quote' | 'p'; text: string; items?: never }
  | { type: 'ul' | 'ol'; text?: never; items: string[] }

const route = useRoute()
const slug = route.params.slug as string

const { data, pending } = await useFetch<ArticleResponse>(`/api/articles/${slug}`)
const { data: listingData } = await useFetch<ArticleListResponse>('/api/articles', {
  query: { page: 1, pageSize: 100 },
})

const article = computed(() => data.value?.data)
const categoryInfo = computed(() => {
  if (!article.value) return undefined
  return academyCategoryMap[article.value.category]
})

const parseContent = (content: string): ContentBlock[] => {
  if (!content) return []

  return content
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk): ContentBlock => {
      if (chunk.startsWith('### ')) return { type: 'h3', text: chunk.slice(4).trim() }
      if (chunk.startsWith('## ')) return { type: 'h2', text: chunk.slice(3).trim() }

      const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean)
      if (lines.length && lines.every((line) => /^[-*]\s+/.test(line))) {
        return { type: 'ul', items: lines.map((line) => line.replace(/^[-*]\s+/, '')) }
      }
      if (lines.length && lines.every((line) => /^\d+[.)]\s+/.test(line))) {
        return { type: 'ol', items: lines.map((line) => line.replace(/^\d+[.)]\s+/, '')) }
      }
      if (lines.length && lines.every((line) => line.startsWith('> '))) {
        return { type: 'quote', text: lines.map((line) => line.slice(2)).join(' ') }
      }
      return { type: 'p', text: lines.join(' ') }
    })
}

const contentBlocks = computed(() => parseContent(article.value?.content || ''))

const relatedArticles = computed(() => {
  if (!article.value) return []
  return (listingData.value?.data || [])
    .filter((item) => item.category === article.value?.category && item.slug !== article.value?.slug)
    .slice(0, 3)
})

const shareState = ref('')
const shareArticle = async () => {
  if (!import.meta.client || !article.value) return
  const shareData = {
    title: article.value.title,
    text: article.value.summary,
    url: window.location.href,
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
      shareState.value = '已打开分享'
    } else {
      await navigator.clipboard.writeText(window.location.href)
      shareState.value = '链接已复制'
    }
  } catch (error: any) {
    if (error?.name !== 'AbortError') shareState.value = '分享失败'
  }
}

const { t } = useI18n()
const resolveOgImage = useOgImageResolver()
const ogImage = computed(() => resolveOgImage(article.value?.cover_url))

useSeoMeta({
  title: () => article.value ? `${article.value.title} - ${t('common.appName')}` : `小概率学院 - ${t('common.appName')}`,
  description: () => article.value?.summary || '独立开发者的小生意实践库。',
  keywords: () => article.value ? `独立开发,独立开发者,小生意,${article.value.series}` : '独立开发,独立开发者,小生意',
  ogTitle: () => article.value?.title,
  ogDescription: () => article.value?.summary,
  ogImage: () => ogImage.value,
  ogType: 'article',
})

useCanonical(`/academy/${slug}`)

const structuredData = computed(() => article.value ? JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.value.title,
  description: article.value.summary,
  ...(article.value.cover_url ? { image: article.value.cover_url } : {}),
  author: {
    '@type': 'Organization',
    name: article.value.author?.username || '小概率编辑部',
  },
  publisher: {
    '@type': 'Organization',
    name: t('common.appName'),
    url: 'https://mirauni.com',
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `https://mirauni.com/academy/${slug}`,
  },
}) : '{}')

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: structuredData },
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://mirauni.com/' },
          { '@type': 'ListItem', position: 2, name: '学院', item: 'https://mirauni.com/academy' },
          { '@type': 'ListItem', position: 3, name: article.value?.title || '文章详情', item: `https://mirauni.com/academy/${slug}` },
        ],
      })),
    },
  ],
})

const { trackPageView } = useTrack()
onMounted(() => {
  if (article.value?.title) trackPageView(`文章: ${article.value.title}`)
})
</script>

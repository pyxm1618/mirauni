<template>
  <div class="bg-indie-bg min-h-screen pb-24">
    <section class="bg-white border-b-4 border-black">
      <div class="container mx-auto px-4 py-14 md:py-20">
        <div class="grid lg:grid-cols-[1.6fr_0.8fr] gap-10 lg:gap-16 items-end">
          <div>
            <div class="inline-flex items-center gap-2 bg-black text-white px-4 py-2 font-black text-xs md:text-sm tracking-[0.18em] uppercase mb-6 shadow-brutal">
              SMALL BUSINESS / REAL BUILD
            </div>
            <h1 class="text-5xl md:text-7xl lg:text-8xl font-black font-display tracking-tight leading-[0.92] mb-8">
              小产品，<br />也可以是一门生意。
            </h1>
            <p class="text-xl md:text-2xl font-bold text-gray-800 max-w-3xl border-l-8 border-indie-secondary pl-6 py-1 leading-relaxed">
              研究独立开发者如何发现机会、做出产品、获得用户，并把产品变成一门小生意。
            </p>
          </div>

          <aside class="bg-indie-primary border-3 border-black shadow-brutal-lg p-6 md:p-8 rotate-1">
            <p class="text-xs font-black tracking-[0.22em] uppercase mb-5">学院不是网课</p>
            <p class="text-2xl md:text-3xl font-black leading-tight mb-6">
              不只讲“怎么做”，也拆别人为什么能赚钱、哪里失败、今天还有没有机会。
            </p>
            <div class="grid grid-cols-3 gap-3 border-t-3 border-black pt-5">
              <div>
                <div class="text-3xl font-black">{{ articles.length || 30 }}</div>
                <div class="text-xs font-bold mt-1">首批文章</div>
              </div>
              <div>
                <div class="text-3xl font-black">{{ academyCategories.length }}</div>
                <div class="text-xs font-bold mt-1">内容板块</div>
              </div>
              <div>
                <div class="text-3xl font-black">100%</div>
                <div class="text-xs font-bold mt-1">标注来源</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <main class="container mx-auto px-4 pt-14 md:pt-20">
      <div v-if="pending" class="space-y-12">
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="h-[430px] bg-white border-3 border-black animate-pulse opacity-50"></div>
        </div>
      </div>

      <div v-else-if="error" class="bg-white border-3 border-black shadow-brutal p-10 text-center">
        <p class="text-3xl font-black mb-3">学院内容暂时没有加载出来</p>
        <p class="font-bold text-gray-600">刷新页面后再试一次。</p>
      </div>

      <template v-else>
        <section v-if="featuredArticles.length" class="mb-20">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b-4 border-black pb-5 mb-8">
            <div>
              <div class="text-xs font-black tracking-[0.22em] uppercase mb-2">EDITOR'S PICKS</div>
              <h2 class="text-4xl md:text-5xl font-black tracking-tight">本期值得看</h2>
            </div>
            <p class="font-bold text-gray-600 max-w-xl md:text-right">
              先从故事、商业判断和一个能直接拿去用的方法开始，不需要按“第一课、第二课”往下学。
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ArticleCard
              v-for="(article, index) in featuredArticles"
              :key="article.slug"
              :article="article"
              :index="index"
            />
          </div>
        </section>

        <section class="mb-20">
          <div class="border-b-4 border-black pb-5 mb-8">
            <div class="text-xs font-black tracking-[0.22em] uppercase mb-2">SIX LENSES</div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tight">六条线索，看懂一门小生意</h2>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <button
              v-for="(category, index) in academyCategories"
              :key="category.id"
              type="button"
              class="text-left bg-white border-3 border-black shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all p-6 min-h-[210px] flex flex-col"
              @click="selectCategory(category.id)"
            >
              <div class="flex items-start justify-between gap-4 mb-7">
                <span class="text-xs font-black tracking-[0.18em] border-2 border-black px-2 py-1 bg-indie-bg">
                  {{ category.eyebrow }}
                </span>
                <span class="text-4xl font-black text-black/15">0{{ index + 1 }}</span>
              </div>
              <h3 class="text-2xl font-black mb-3">{{ category.label }}</h3>
              <p class="font-bold text-sm text-gray-600 leading-relaxed mb-5">{{ category.description }}</p>
              <div class="mt-auto flex items-center justify-between border-t-2 border-black pt-3 text-xs font-black">
                <span>{{ categoryCount(category.id) }} 篇</span>
                <span>去看 →</span>
              </div>
            </button>
          </div>
        </section>

        <section id="all-articles" class="scroll-mt-28">
          <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 border-b-4 border-black pb-6 mb-8">
            <div>
              <div class="text-xs font-black tracking-[0.22em] uppercase mb-2">THE ARCHIVE</div>
              <h2 class="text-4xl md:text-5xl font-black tracking-tight">全部文章</h2>
            </div>
            <div class="flex gap-3 overflow-x-auto pb-2 lg:pb-0 max-w-full">
              <button
                type="button"
                class="px-4 py-2 border-3 border-black font-black whitespace-nowrap shadow-[2px_2px_0_0_#000] transition-all"
                :class="activeCategory === 'all' ? 'bg-black text-white' : 'bg-white hover:-translate-y-0.5'"
                @click="activeCategory = 'all'"
              >
                全部 · {{ articles.length }}
              </button>
              <button
                v-for="category in academyCategories"
                :key="category.id"
                type="button"
                class="px-4 py-2 border-3 border-black font-black whitespace-nowrap shadow-[2px_2px_0_0_#000] transition-all"
                :class="activeCategory === category.id ? 'bg-black text-white' : 'bg-white hover:-translate-y-0.5'"
                @click="activeCategory = category.id"
              >
                {{ category.label }} · {{ categoryCount(category.id) }}
              </button>
            </div>
          </div>

          <div v-if="filteredArticles.length" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ArticleCard
              v-for="(article, index) in filteredArticles"
              :key="article.slug"
              :article="article"
              :index="index"
            />
          </div>

          <div v-else class="bg-white border-3 border-black border-dashed p-16 text-center">
            <p class="text-2xl font-black">这个栏目还没有文章。</p>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import ArticleCard from '~/components/academy/ArticleCard.vue'
import { academyCategories } from '~/data/academy-content'
import type { AcademyArticle, AcademyCategoryId } from '~/data/academy/types'

interface ArticleResponse {
  success: boolean
  data: AcademyArticle[]
  meta: {
    total: number
    page: number
    pageSize: number
  }
}

const activeCategory = ref<'all' | AcademyCategoryId>('all')

const { data, pending, error } = await useFetch<ArticleResponse>('/api/articles', {
  query: { page: 1, pageSize: 100 },
})

const articles = computed(() => data.value?.data || [])

const featuredArticles = computed(() => {
  const featured = articles.value.filter((article) => article.featured)
  if (featured.length >= 3) return featured.slice(0, 3)
  return articles.value.slice(0, 3)
})

const filteredArticles = computed(() => {
  if (activeCategory.value === 'all') return articles.value
  return articles.value.filter((article) => article.category === activeCategory.value)
})

const categoryCount = (category: AcademyCategoryId) =>
  articles.value.filter((article) => article.category === category).length

const selectCategory = (category: AcademyCategoryId) => {
  activeCategory.value = category
  if (import.meta.client) {
    requestAnimationFrame(() => {
      document.getElementById('all-articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}

const { t } = useI18n()
const resolveOgImage = useOgImageResolver()
const ogImage = resolveOgImage()

useSeoMeta({
  title: () => `小概率学院 - ${t('common.appName')}`,
  description: '独立开发者的小生意实践库：真实故事、商业拆解、机会判断、产品开发、SEO 与增长、隐私合规和经营。',
  keywords: '独立开发,独立开发者,小生意,产品拆解,SEO,AI Coding,MVP,创业案例,网站增长',
  ogTitle: () => `小概率学院 - ${t('common.appName')}`,
  ogDescription: '研究独立开发者如何发现机会、做出产品、获得用户，并把产品变成一门小生意。',
  ogImage,
})

useCanonical('/academy')
</script>

<template>
  <NuxtLink
    :to="'/academy/' + article.slug"
    class="group block h-full bg-white border-3 border-black shadow-brutal hover:shadow-brutal-hover hover:-translate-y-1 transition-all duration-300 relative"
  >
    <div class="aspect-[16/8] overflow-hidden relative border-b-3 border-black bg-indie-bg">
      <img
        v-if="article.cover_url"
        :src="article.cover_url"
        :alt="article.title"
        width="800"
        height="400"
        loading="lazy"
        decoding="async"
        class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
      />
      <div v-else class="h-full p-5 flex flex-col justify-between pattern-grid">
        <div class="flex items-start justify-between gap-4">
          <span class="text-xs font-black tracking-[0.22em] uppercase border-2 border-black bg-white px-2 py-1">
            {{ eyebrow }}
          </span>
          <span class="font-black text-5xl leading-none text-black/10">{{ indexLabel }}</span>
        </div>
        <div>
          <p class="text-sm font-black uppercase tracking-widest mb-1">小概率学院</p>
          <p class="text-2xl md:text-3xl font-black leading-none">{{ article.series || categoryLabel }}</p>
        </div>
      </div>

      <div class="absolute top-0 right-0 bg-black text-white px-3 py-1 text-sm font-black border-l-3 border-b-3 border-black">
        {{ article.series || categoryLabel }}
      </div>
    </div>

    <div class="p-6 flex flex-col min-h-[270px]">
      <p v-if="article.featured" class="text-xs font-black tracking-[0.18em] uppercase mb-3">
        EDITOR'S PICK
      </p>
      <h3 class="text-xl md:text-2xl font-black mb-3 group-hover:underline decoration-4 decoration-indie-primary line-clamp-3 leading-tight">
        {{ article.title }}
      </h3>
      <p class="text-gray-700 font-bold text-sm line-clamp-4 mb-6 leading-relaxed">
        {{ article.summary || '暂无摘要' }}
      </p>

      <div class="mt-auto flex items-center justify-end gap-4 text-xs font-black border-t-2 border-black pt-4">
        <span class="whitespace-nowrap group-hover:translate-x-1 transition-transform">阅读全文 →</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { academyCategoryMap } from '~/data/academy-content'

const props = defineProps<{
  article: any
  index?: number
}>()

const category = computed(() => academyCategoryMap[props.article.category as keyof typeof academyCategoryMap])
const categoryLabel = computed(() => category.value?.label || props.article.category || '学院')
const eyebrow = computed(() => category.value?.eyebrow || 'ACADEMY')
const indexLabel = computed(() => String((props.index ?? 0) + 1).padStart(2, '0'))
</script>

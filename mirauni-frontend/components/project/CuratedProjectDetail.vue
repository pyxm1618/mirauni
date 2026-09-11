<template>
  <article class="mx-auto max-w-5xl">
    <NuxtLink to="/projects" class="mb-7 inline-block border-b-2 border-black px-1 font-black hover:bg-black hover:text-white">← 返回项目广场</NuxtLink>

    <header class="mb-10 border-3 border-black bg-white p-6 shadow-brutal md:p-9">
      <div class="mb-7 flex flex-wrap items-start justify-between gap-5">
        <div class="flex items-center gap-4">
          <div class="flex h-16 w-16 items-center justify-center border-3 border-black bg-indie-primary text-lg font-black shadow-[4px_4px_0_0_#000]">
            {{ projectMark }}
          </div>
          <div>
            <div class="mb-2 inline-block border-2 border-black bg-black px-2.5 py-1 text-xs font-black text-white">平台精选</div>
            <div class="text-xs font-black tracking-[0.16em] text-gray-500">CURATED BY 小概率</div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-if="project.industry" class="border-2 border-black bg-indie-secondary/30 px-3 py-1 text-xs font-black">{{ industryLabel }}</span>
          <span class="border-2 border-black bg-gray-100 px-3 py-1 text-xs font-black">{{ categoryLabel }}</span>
          <span class="border-2 border-black bg-white px-3 py-1 text-xs font-black">开源项目</span>
        </div>
      </div>

      <h1 class="mb-5 text-4xl font-display font-black leading-tight md:text-7xl">{{ project.title }}</h1>
      <p class="max-w-4xl border-l-4 border-black pl-5 text-lg font-bold leading-8 text-gray-700 md:text-xl">{{ project.summary }}</p>
    </header>

    <div class="grid gap-7">
      <section class="border-3 border-black bg-white p-6 shadow-brutal md:p-8">
        <div class="mb-5 text-xs font-black tracking-[0.18em] text-gray-500">WHAT IT DOES</div>
        <h2 class="mb-5 inline-block border-b-4 border-black text-2xl font-black md:text-3xl">它在做什么</h2>
        <p class="whitespace-pre-wrap text-base font-medium leading-8 text-gray-800 md:text-lg">{{ project.description }}</p>
      </section>

      <section v-if="features.length" class="border-3 border-black bg-indie-primary p-6 shadow-brutal md:p-8">
        <div class="mb-5 text-xs font-black tracking-[0.18em]">CORE CAPABILITIES</div>
        <h2 class="mb-6 inline-block border-b-4 border-black text-2xl font-black md:text-3xl">核心能力</h2>
        <div class="grid gap-3 md:grid-cols-2">
          <div v-for="(feature, index) in features" :key="feature" class="flex gap-4 border-2 border-black bg-white p-4 font-bold leading-6">
            <span class="font-mono text-sm font-black">0{{ index + 1 }}</span>
            <span>{{ feature }}</span>
          </div>
        </div>
      </section>

      <section v-if="meta.editorial_reason" class="relative overflow-hidden border-3 border-black bg-black p-6 text-white shadow-brutal md:p-8">
        <div class="absolute right-4 top-1 text-7xl font-black text-white/10">?</div>
        <div class="mb-5 text-xs font-black tracking-[0.18em] text-gray-300">EDITOR'S NOTE</div>
        <h2 class="mb-5 text-2xl font-black md:text-3xl">为什么值得看</h2>
        <p class="relative max-w-4xl text-base font-bold leading-8 md:text-lg">{{ meta.editorial_reason }}</p>
      </section>

      <section class="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        <div class="border-3 border-black bg-white p-6 shadow-brutal">
          <div class="mb-5 text-xs font-black tracking-[0.18em] text-gray-500">PRODUCT INFO</div>
          <h2 class="mb-5 text-2xl font-black">技术与产品信息</h2>
          <dl class="grid gap-4 text-sm">
            <div v-if="meta.tech_stack?.length">
              <dt class="mb-2 font-black text-gray-500">技术栈</dt>
              <dd class="flex flex-wrap gap-2">
                <span v-for="tech in meta.tech_stack" :key="tech" class="border-2 border-black bg-gray-100 px-2 py-1 font-bold">{{ tech }}</span>
              </dd>
            </div>
            <div v-if="meta.license">
              <dt class="mb-1 font-black text-gray-500">许可证</dt>
              <dd class="font-bold">{{ meta.license }}</dd>
            </div>
            <div v-if="project.source_repo">
              <dt class="mb-1 font-black text-gray-500">原项目</dt>
              <dd class="break-all font-mono font-bold">{{ project.source_repo }}</dd>
            </div>
          </dl>
        </div>

        <div class="border-3 border-black bg-indie-accent p-6 shadow-brutal">
          <div class="mb-5 text-xs font-black tracking-[0.18em]">SOURCE</div>
          <h2 class="mb-5 text-2xl font-black">去原项目看看</h2>
          <p class="mb-6 font-bold leading-7">小概率只负责筛选和整理。功能、版本、许可证与使用方式，以项目自己的官网和仓库为准。</p>
          <div class="flex flex-col gap-3 sm:flex-row">
            <a v-if="officialUrl" :href="officialUrl" target="_blank" rel="noopener noreferrer" class="border-3 border-black bg-white px-5 py-3 text-center font-black shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">访问官网 ↗</a>
            <a v-if="project.source_url" :href="project.source_url" target="_blank" rel="noopener noreferrer" class="border-3 border-black bg-black px-5 py-3 text-center font-black text-white shadow-[3px_3px_0_0_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">查看 GitHub ↗</a>
          </div>
        </div>
      </section>

      <aside class="border-2 border-black bg-gray-50 p-5 text-sm font-bold leading-6 text-gray-600">
        本条由小概率根据项目公开资料整理，非项目方发布，不代表项目方正在小概率招募合作伙伴。
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Project } from '~/types'
import { PROJECT_CATEGORIES, PROJECT_INDUSTRIES } from '~/types'

const props = defineProps<{ project: Project }>()

const meta = computed(() => props.project.curated_meta || {})
const features = computed(() => meta.value.features || [])
const officialUrl = computed(() => meta.value.official_url || props.project.demo_url || '')
const categoryLabel = computed(() => PROJECT_CATEGORIES.find(item => item.value === props.project.category)?.label || props.project.category)
const industryLabel = computed(() => PROJECT_INDUSTRIES.find(item => item.value === props.project.industry)?.label || props.project.industry || '')
const projectMark = computed(() => {
  const words = props.project.title.trim().split(/[\s.\-_]+/).filter(Boolean)
  if (words.length > 1) return words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
  return props.project.title.replace(/[^A-Za-z0-9\u4e00-\u9fff]/g, '').slice(0, 2).toUpperCase() || 'P'
})
</script>

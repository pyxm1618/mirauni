<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-10 border-b-4 border-black pb-8">
      <div class="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div class="max-w-3xl">
          <div class="mb-3 inline-block border-2 border-black bg-indie-primary px-3 py-1 text-xs font-black tracking-widest shadow-[3px_3px_0_0_#000]">
            PROJECT SQUARE
          </div>
          <h1 class="text-4xl font-display font-black leading-tight md:text-6xl">看看别人正在做什么，也找到值得一起做的项目。</h1>
          <p class="mt-4 max-w-2xl text-base font-bold leading-7 text-gray-700 md:text-lg">
            真实项目、独立产品和小概率编辑精选。想找伙伴，也可以发布你正在做的东西。
          </p>
        </div>
        <NuxtLink to="/projects/create" class="flex items-center gap-2 border-3 border-black bg-black px-7 py-3 text-lg font-black text-white shadow-brutal transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-indie-primary hover:text-black hover:shadow-brutal-hover">
          <span class="text-2xl">+</span> 发布项目
        </NuxtLink>
      </div>

      <div class="grid gap-5">
        <div class="relative w-full md:max-w-2xl">
          <div class="absolute inset-0 translate-x-2 translate-y-2 bg-black"></div>
          <input
            v-model.lazy="filters.keyword"
            type="text"
            placeholder="搜索项目名称或它正在解决的问题"
            class="relative w-full border-3 border-black bg-white p-4 text-lg font-bold placeholder-gray-400 focus:outline-none"
          />
        </div>

        <div class="flex flex-wrap gap-3">
          <select v-model="filters.listing_type" class="cursor-pointer border-3 border-black bg-white px-4 py-2 font-bold focus:outline-none hover:-translate-y-1 hover:shadow-brutal transition-all">
            <option value="">全部来源</option>
            <option value="owner">项目方发布</option>
            <option value="curated">平台精选</option>
          </select>

          <select v-model="filters.industry" class="cursor-pointer border-3 border-black bg-white px-4 py-2 font-bold focus:outline-none hover:-translate-y-1 hover:shadow-brutal transition-all">
            <option value="">全部行业</option>
            <option v-for="item in PROJECT_INDUSTRIES" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>

          <select v-model="filters.category" class="cursor-pointer border-3 border-black bg-white px-4 py-2 font-bold focus:outline-none hover:-translate-y-1 hover:shadow-brutal transition-all">
            <option value="">全部产品形态</option>
            <option v-for="item in PROJECT_CATEGORIES" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>

          <select v-model="filters.role" class="cursor-pointer border-3 border-black bg-white px-4 py-2 font-bold focus:outline-none hover:-translate-y-1 hover:shadow-brutal transition-all">
            <option value="">全部招募角色</option>
            <option v-for="item in ROLES" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>

          <button v-if="isFiltered" type="button" class="border-3 border-black bg-gray-100 px-4 py-2 font-black hover:bg-black hover:text-white" @click="resetFilters">
            清除筛选
          </button>
        </div>
      </div>
    </div>

    <div class="mb-6 flex items-end justify-between gap-4">
      <div>
        <div class="text-xs font-black tracking-[0.18em] text-gray-500">REAL PROJECTS / CURATED PICKS</div>
        <h2 class="mt-1 text-2xl font-black">项目目录</h2>
      </div>
      <div v-if="!pending" class="border-b-2 border-black text-sm font-black">{{ projects.length }} 个项目</div>
    </div>

    <div v-if="pending" class="border-3 border-black bg-gray-50 py-16 text-center text-lg font-black">加载项目中...</div>

    <div v-else-if="projects.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
    </div>

    <div v-else class="border-3 border-dashed border-black bg-gray-50 px-6 py-16 text-center">
      <div class="mb-3 text-xl font-black">没有符合当前条件的项目</div>
      <p class="text-gray-500">换一个筛选条件，或者发布你正在做的产品。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectCard from '~/components/project/ProjectCard.vue'
import { PROJECT_CATEGORIES, PROJECT_INDUSTRIES, ROLES } from '~/types'
import type { Project } from '~/types'

interface ProjectListResponse {
  success: boolean
  data: Project[]
  meta: {
    total: number
    page: number
    pageSize: number
  }
}

const filters = ref({
  listing_type: '',
  industry: '',
  category: '',
  role: '',
  keyword: ''
})

const requestQuery = computed(() => ({
  listing_type: filters.value.listing_type || undefined,
  industry: filters.value.industry || undefined,
  category: filters.value.category || undefined,
  role: filters.value.role || undefined,
  keyword: filters.value.keyword || undefined,
  pageSize: 100
}))

const { data, pending } = await useFetch<ProjectListResponse>('/api/projects', {
  query: requestQuery
})

const projects = computed(() => data.value?.data || [])
const isFiltered = computed(() => Object.values(filters.value).some(Boolean))

const resetFilters = () => {
  filters.value = { listing_type: '', industry: '', category: '', role: '', keyword: '' }
}

const resolveOgImage = useOgImageResolver()
const ogImage = resolveOgImage()

useSeoMeta({
  title: '独立产品与真实项目｜项目广场 - 小概率',
  description: '浏览真实独立产品、小概率编辑精选和正在寻找合作伙伴的项目，看看别人正在做什么，也找到值得一起做的项目。',
  keywords: '独立产品,独立开发者项目,项目广场,创业项目,技术合伙人,开源项目',
  ogTitle: '项目广场 - 小概率',
  ogDescription: '真实项目、独立产品和小概率编辑精选。',
  ogImage
})

useCanonical('/projects')
</script>

<template>
  <div class="container mx-auto px-4 py-8">
      <div class="mb-12 border-b-4 border-black pb-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h1 class="text-5xl md:text-6xl font-display font-black">{{ $t('project.square.title') }}</h1>
            <p class="mt-3 text-lg font-bold text-gray-700">创业项目招募开发者，快速找到技术合伙人。</p>
          </div>
          <NuxtLink to="/projects/create" class="px-8 py-3 bg-black text-white border-3 border-black font-bold text-xl shadow-brutal hover:bg-indie-primary hover:text-black hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2">
              <span class="text-2xl">+</span> {{ $t('project.square.launch') }}
          </NuxtLink>
        </div>
        
        <!-- Brutalist Search & Filter -->
        <div class="flex flex-col gap-6">
            <!-- Search -->
            <div class="relative w-full md:max-w-xl">
                <div class="absolute inset-0 bg-black translate-x-2 translate-y-2"></div>
                <input
                  v-model.lazy="filters.keyword"
                  type="text" 
                  :placeholder="$t('project.square.search')"
                  class="relative w-full bg-white border-3 border-black p-4 font-bold text-xl focus:outline-none placeholder-gray-400"
                />
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap gap-4">
               <select v-model="filters.category" class="px-4 py-2 border-3 border-black bg-white font-bold focus:outline-none hover:shadow-brutal hover:-translate-y-1 transition-all cursor-pointer">
                  <option value="">{{ $t('project.square.category') }}</option>
                  <option v-for="c in PROJECT_CATEGORIES" :key="c.value" :value="c.value">{{ $t('project.categories.' + c.value) }}</option>
                </select>
                <select v-model="filters.work_mode" class="px-4 py-2 border-3 border-black bg-white font-bold focus:outline-none hover:shadow-brutal hover:-translate-y-1 transition-all cursor-pointer">
                  <option value="">{{ $t('project.square.mode') }}</option>
                  <option v-for="c in WORK_MODES" :key="c.value" :value="c.value">{{ $t('project.workModes.' + c.value) }}</option>
                </select>
                <select v-model="filters.role" class="px-4 py-2 border-3 border-black bg-white font-bold focus:outline-none hover:shadow-brutal hover:-translate-y-1 transition-all cursor-pointer">
                  <option value="">{{ $t('project.square.role') }}</option>
                  <option v-for="c in ROLES" :key="c.value" :value="c.value">{{ $t('roles.' + c.value) }}</option>
                </select>
            </div>
        </div>
    </div>

    <div class="mb-8 border-2 border-black bg-yellow-100 p-4 font-bold text-sm">
      冷启动说明：当前列表包含平台演示样板项目，帮助你参考“如何写一条更容易招到技术合伙人的项目招募信息”。
    </div>

    <!-- 项目列表 -->
    <div v-if="pending" class="text-center py-12 text-gray-500">
        {{ $t('project.square.loading') }}
    </div>
    <div v-else-if="projects.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard v-for="p in projects" :key="p.id" :project="p" />
    </div>
    <div v-else class="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-300">
        <div class="text-xl text-gray-500 mb-4">{{ $t('project.square.empty') }}</div>
        <p class="text-gray-400">{{ $t('project.square.emptyHint') }}<NuxtLink to="/projects/create" class="text-indie-primary underline">{{ $t('project.square.launchFirst') }}</NuxtLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectCard from '~/components/project/ProjectCard.vue'
import { PROJECT_CATEGORIES, WORK_MODES, ROLES } from '~/types'
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
  category: '',
  work_mode: '',
  role: '',
  keyword: ''
})

const { data, pending } = await useFetch<ProjectListResponse>('/api/projects', {
  query: filters
})

const projects = computed(() => data.value?.data || [])
const { t } = useI18n()

useSeoMeta({
  title: '创业项目招募开发者｜找技术合伙人 - 小概率',
  description: '发布创业项目，招募前端、后端、全栈和 Flutter 开发者。查看样板项目，快速写出高转化的技术合伙人招募页。',
  keywords: '创业项目招募开发者,找技术合伙人,招募技术合伙人,找程序员合伙做项目',
  ogTitle: '创业项目招募开发者 - 小概率',
  ogDescription: '发布项目，快速找到靠谱技术合伙人。'
})

useCanonical('/projects')
</script>

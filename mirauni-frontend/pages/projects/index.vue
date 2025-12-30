<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-12 border-b-4 border-black pb-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <h1 class="text-6xl md:text-7xl font-display font-black uppercase">{{ $t('project.square.title') }}</h1>
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
                  class="relative w-full bg-white border-3 border-black p-4 font-bold text-xl focus:outline-none placeholder-gray-400 uppercase"
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
  title: t('project.square.seoTitle'),
  description: t('project.square.seoDesc'),
  ogTitle: t('project.square.seoTitle'),
  ogDescription: t('project.square.seoDesc')
})
</script>

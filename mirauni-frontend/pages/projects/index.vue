<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-12 border-b-4 border-black pb-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <h1 class="text-6xl md:text-7xl font-display font-black uppercase">Projects<br>Square</h1>
          <NuxtLink to="/projects/create" class="px-8 py-3 bg-black text-white border-3 border-black font-bold text-xl shadow-brutal hover:bg-indie-primary hover:text-black hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2">
              <span class="text-2xl">+</span> 发布项目
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
                  placeholder="SEARCH_PROJECTS..." 
                  class="relative w-full bg-white border-3 border-black p-4 font-bold text-xl focus:outline-none placeholder-gray-400 uppercase"
                />
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap gap-4">
               <select v-model="filters.category" class="px-4 py-2 border-3 border-black bg-white font-bold focus:outline-none hover:shadow-brutal hover:-translate-y-1 transition-all cursor-pointer">
                  <option value="">CATEGORY / 全部分类</option>
                  <option v-for="c in PROJECT_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
                <select v-model="filters.work_mode" class="px-4 py-2 border-3 border-black bg-white font-bold focus:outline-none hover:shadow-brutal hover:-translate-y-1 transition-all cursor-pointer">
                  <option value="">MODE / 工作模式</option>
                  <option v-for="c in WORK_MODES" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
                <select v-model="filters.role" class="px-4 py-2 border-3 border-black bg-white font-bold focus:outline-none hover:shadow-brutal hover:-translate-y-1 transition-all cursor-pointer">
                  <option value="">ROLE / 需求角色</option>
                  <option v-for="c in ROLES" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
            </div>
        </div>
    </div>

    <!-- 项目列表 -->
    <div v-if="pending" class="text-center py-12 text-gray-500">
        加载中...
    </div>
    <div v-else-if="projects.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard v-for="p in projects" :key="p.id" :project="p" />
    </div>
    <div v-else class="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-300">
        <div class="text-xl text-gray-500 mb-4">暂无符合条件的项目</div>
        <p class="text-gray-400">试着调整筛选条件，或者<NuxtLink to="/projects/create" class="text-indie-primary underline">发布第一个项目</NuxtLink></p>
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

useSeoMeta({
  title: '创业项目招募 - 小概率',
  description: '浏览独立开发者的创业项目，找到感兴趣的项目加入，成为技术合伙人',
  ogTitle: '创业项目招募 - 小概率',
  ogDescription: '浏览独立开发者的创业项目，找到感兴趣的项目加入'
})
</script>

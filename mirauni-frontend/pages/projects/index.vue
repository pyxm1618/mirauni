<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-display font-bold">创业项目招募</h1>
        <NuxtLink to="/projects/create" class="bg-indie-primary border-2 border-black px-6 py-2 font-bold hover:shadow-brutal hover:-translate-y-1 transition-all flex items-center gap-2">
            <span class="text-xl">+</span> 发布项目
        </NuxtLink>
    </div>
    
    <!-- 筛选栏 -->
    <div class="bg-white border-2 border-indie-border shadow-brutal p-4 mb-8">
      <div class="flex flex-wrap gap-4">
        <select v-model="filters.category" class="px-4 py-2 border-2 border-indie-border bg-white focus:outline-none hover:border-black transition-colors">
          <option value="">全部分类</option>
          <option v-for="c in PROJECT_CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
        <select v-model="filters.work_mode" class="px-4 py-2 border-2 border-indie-border bg-white focus:outline-none hover:border-black transition-colors">
          <option value="">工作模式</option>
          <option v-for="c in WORK_MODES" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
        <select v-model="filters.role" class="px-4 py-2 border-2 border-indie-border bg-white focus:outline-none hover:border-black transition-colors">
          <option value="">需求角色</option>
          <option v-for="c in ROLES" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
        <input 
          v-model.lazy="filters.keyword"
          type="text" 
          placeholder="搜索项目..."
          class="flex-1 min-w-[200px] px-4 py-2 border-2 border-indie-border focus:outline-none focus:shadow-brutal-sm transition-all"
        />
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

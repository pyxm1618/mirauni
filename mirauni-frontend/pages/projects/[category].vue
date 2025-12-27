<template>
  <div class="container mx-auto px-4 py-12">
    <div class="mb-12 border-b-4 border-black pb-8">
       <NuxtLink to="/projects" class="inline-block px-6 py-2 bg-black text-white font-black uppercase mb-6 hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
         ← BACK TO ALL
       </NuxtLink>
       <h1 class="text-6xl font-black font-display mb-4 uppercase tracking-tighter">{{ categoryLabel }} PROJECT_S</h1>
       <p class="text-xl font-bold bg-yellow-300 inline-block px-4 py-2 border-2 border-black shadow-brutal uppercase">
         EXPLORE ALL {{ categoryLabel }} VENTURES
       </p>
    </div>

    <!-- List -->
    <div v-if="pending" class="text-center py-20 font-black text-2xl uppercase animate-pulse">LOADING PROJECTS...</div>
    <div v-else-if="projects.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <ProjectCard v-for="p in projects" :key="p.id" :project="p" />
    </div>
    <div v-else class="text-center py-20 bg-white border-3 border-black shadow-brutal">
        <div class="text-6xl mb-4 grayscale font-black">/</div>
        <p class="font-black text-2xl uppercase text-gray-400">NO PROJECTS FOUND IN THIS CATEGORY</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectCard from '~/components/project/ProjectCard.vue'
import { PROJECT_CATEGORIES } from '~/types'
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

const route = useRoute()
const category = route.params.category as string

const { data, pending } = await useFetch<ProjectListResponse>('/api/projects', {
  query: { category, pageSize: 100 }
})

const projects = computed(() => data.value?.data || [])

const categoryLabel = computed(() => PROJECT_CATEGORIES.find(c => c.value === category)?.label || category)

useSeoMeta({
  title: () => `${categoryLabel.value} 项目 - 小概率`,
  description: () => `浏览所有 ${categoryLabel.value} 类别的创业项目`,
  ogTitle: () => `${categoryLabel.value} 项目 - 小概率`
})
</script>

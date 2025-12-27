<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
       <NuxtLink to="/projects" class="text-gray-500 hover:text-black mb-2 inline-block">← 全部项目</NuxtLink>
       <h1 class="text-4xl font-display font-bold mb-4">{{ categoryLabel }} 项目</h1>
       <p class="text-gray-600">浏览所有 {{ categoryLabel }} 类别的创业项目</p>
    </div>

    <!-- List -->
    <div v-if="pending" class="text-center py-12">加载中...</div>
    <div v-else-if="projects.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard v-for="p in projects" :key="p.id" :project="p" />
    </div>
    <div v-else class="text-center py-12 text-gray-500">
        暂无该分类的项目
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

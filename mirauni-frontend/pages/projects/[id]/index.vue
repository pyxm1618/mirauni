<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="pending" class="text-center py-12">加载中...</div>
    <div v-else-if="error" class="text-center py-12 text-red-500">
      加载失败: {{ error.message }}
    </div>
    <div v-else-if="project" class="max-w-4xl mx-auto">
       <!-- Header -->
       <div class="mb-8">
          <NuxtLink to="/projects" class="inline-block mb-4 text-gray-500 hover:text-black transition-colors">← 返回列表</NuxtLink>
          <div class="flex flex-wrap items-center gap-3 mb-4">
             <span class="px-3 py-1 bg-indie-secondary border border-indie-border text-sm">{{ getCategoryLabel(project.category) }}</span>
             <span class="px-3 py-1 bg-gray-100 border border-gray-300 text-sm">{{ getWorkModeLabel(project.work_mode) }}</span>
             <span class="text-gray-500 text-sm">发布于 {{ formatDate(project.created_at) }}</span>
             <span v-if="project.status !== 'active'" class="px-2 py-1 bg-red-100 text-red-600 text-xs border border-red-200 rounded">
                {{ project.status === 'closed' ? '已关闭' : '审核中/未公开' }}
             </span>
          </div>
          <h1 class="text-4xl font-display font-bold mb-4">{{ project.title }}</h1>
          <p class="text-xl text-gray-600 mb-6">{{ project.summary }}</p>
          
          <div class="flex flex-wrap items-center gap-4 border-t-2 border-gray-100 pt-6">
             <div class="flex items-center gap-3 bg-white pr-4 rounded-full" v-if="project.users">
                 <img :src="project.users.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + project.users.username" class="w-12 h-12 rounded-full border-2 border-black bg-gray-100" />
                 <div>
                    <div class="font-bold text-lg">{{ project.users.username }}</div>
                    <div class="text-xs text-gray-500 max-w-[200px] truncate">{{ project.users.bio || '暂无简介' }}</div>
                 </div>
             </div>
             
             <div class="flex-1"></div>
             
             <!-- Actions -->
             <NuxtLink v-if="project.is_owner" :to="`/projects/${project.id}/edit`" class="bg-gray-100 border-2 border-black px-4 py-2 font-bold hover:bg-gray-200 transition-colors">
                编辑项目
             </NuxtLink>
             <button class="bg-indie-primary border-2 border-black px-6 py-2 font-bold hover:shadow-brutal hover:-translate-y-1 transition-all">
                {{ project.is_unlocked || project.is_owner ? '联系作者' : '解锁联系方式' }}
             </button>
          </div>
       </div>
       
       <!-- Content Cards -->
       <div class="grid gap-6">
           <!-- Basic Info -->
           <div class="bg-white border-2 border-indie-border shadow-brutal p-6 relative overflow-hidden">
              <div class="absolute top-0 left-0 w-2 h-full bg-indie-primary"></div>
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-black"></span> 招募需求
              </h3>
              <div class="flex flex-wrap gap-3 mb-6">
                  <span v-for="role in project.roles_needed" :key="role" class="px-3 py-1 bg-indie-primary text-sm font-bold border border-black shadow-brutal-sm">
                    {{ getRoleLabel(role) }}
                  </span>
              </div>
              <div v-if="project.skills_required?.length" class="mb-4">
                  <span class="font-bold block mb-1">技能要求：</span>
                  <div class="flex flex-wrap gap-2">
                      <span v-for="skill in project.skills_required" :key="skill" class="bg-gray-100 px-2 py-0.5 text-sm border border-gray-300">
                          {{ skill }}
                      </span>
                  </div>
              </div>
              <div>
                  <span class="font-bold">合作方式：</span>
                  <span>{{ getCooperationLabel(project.cooperation_type) }}</span>
              </div>
           </div>
           
           <!-- Detail (Description) -->
           <div class="bg-white border-2 border-indie-border shadow-brutal p-8">
              <h3 class="text-xl font-bold mb-6 border-b-2 border-indie-border pb-2">详细介绍</h3>
              <div v-if="project.description" class="prose max-w-none whitespace-pre-wrap leading-relaxed">
                  {{ project.description }}
              </div>
              <div v-else class="text-center py-12 text-gray-500 bg-gray-50 border-2 border-dashed border-gray-300 rounded">
                  <p class="mb-4 text-lg">🔒 该内容仅特定用户可见</p>
                  <button class="bg-white border-2 border-black px-4 py-2 font-bold hover:shadow-brutal transition-all">解锁查看更多</button>
              </div>
           </div>

           <!-- Demo Link -->
           <div class="bg-white border-2 border-indie-border shadow-brutal p-6" v-if="project.demo_url">
               <h3 class="text-xl font-bold mb-4">演示链接</h3>
               <a :href="project.demo_url" target="_blank" class="text-indie-primary underline font-medium hover:text-black break-all">{{ project.demo_url }}</a>
           </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PROJECT_CATEGORIES, WORK_MODES, ROLES, COOPERATION_TYPES } from '~/types'
import type { Project } from '~/types'

interface ProjectDetailResponse {
  success: boolean
  data: Project & {
    is_owner: boolean
    is_unlocked: boolean
    users?: {
      id: string
      username: string
      avatar_url?: string
      bio?: string
    }
  }
}

const route = useRoute()
const { data, pending, error } = await useFetch<ProjectDetailResponse>(`/api/projects/${route.params.id}`)
const project = computed(() => data.value?.data)

const getCategoryLabel = (val: string) => PROJECT_CATEGORIES.find(c => c.value === val)?.label || val
const getWorkModeLabel = (val: string) => WORK_MODES.find(c => c.value === val)?.label || val
const getRoleLabel = (val: string) => ROLES.find(c => c.value === val)?.label || val
const getCooperationLabel = (val: string) => COOPERATION_TYPES.find(c => c.value === val)?.label || val

const formatDate = (date: string) => new Date(date).toLocaleDateString()

useSeoMeta({
  title: () => project.value ? `${project.value.title} - 招募技术合伙人 | 小概率` : '项目详情',
  description: () => project.value?.summary,
  keywords: () => project.value ? `${project.value.category},技术合伙人,找合伙人,${project.value.roles_needed?.join(',')}` : '',
  ogTitle: () => project.value ? `${project.value.title} - 招募技术合伙人` : '项目详情',
  ogDescription: () => project.value?.summary,
  ogType: 'article'
})

// 结构化数据 - JobPosting
const structuredData = computed(() => project.value ? JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: project.value.title,
  description: project.value.summary,
  datePosted: project.value.created_at,
  employmentType: project.value.work_mode === 'remote' ? 'CONTRACTOR' : 'FULL_TIME',
  hiringOrganization: {
    '@type': 'Organization',
    name: '小概率',
    url: 'https://mirauni.com'
  },
  jobLocation: {
    '@type': 'Place',
    address: project.value.work_mode === 'remote' ? '远程办公' : '中国'
  }
}) : '{}')

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: structuredData
    }
  ]
})

// 页面浏览埋点
const { trackProjectView } = useTrack()
onMounted(() => {
  if (project.value?.id) {
    trackProjectView(project.value.id)
  }
})
</script>

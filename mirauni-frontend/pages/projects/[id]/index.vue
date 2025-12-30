<template>
  <div class="container mx-auto px-4 py-12">
    <div v-if="pending" class="text-center py-12 font-bold text-xl uppercase">LOADING...</div>
    <div v-else-if="error" class="text-center py-12 text-red-600 font-bold border-3 border-red-600 bg-red-100 uppercase">
      ERROR: {{ error.message }}
    </div>
    <div v-else-if="project">
      <component :is="activeTheme" :project="project" @unlock="handleUnlockRequest" />
      
      <ClientOnly>
        <UnlockModal 
            :visible="showUnlockModal"
            :credits="user?.unlock_credits || 0"
            :cost="1"
            :loading="unlockLoading"
            @close="showUnlockModal = false"
            @confirm="handleConfirmUnlock"
            @recharge="handleRecharge"
        />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types'

// Theme Components
import BrutalistTheme from '~/components/project/theme/Brutalist.vue'
import MinimalistTheme from '~/components/project/theme/Minimalist.vue'
import CyberTheme from '~/components/project/theme/Cyber.vue'

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
const { data, pending, error, refresh } = await useFetch<ProjectDetailResponse>(`/api/projects/${route.params.id}`)
const project = computed(() => data.value?.data)

// Deterministic Theme Selection
const activeTheme = computed(() => {
  if (!project.value) return BrutalistTheme
  
  // Sum all char codes to get a better distribution than just the first char
  const hash = project.value.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const themeIndex = hash % 3

  switch (themeIndex) {
    case 0: return BrutalistTheme
    case 1: return MinimalistTheme
    case 2: return CyberTheme
    default: return BrutalistTheme
  }
})

// Unlock Modal & Logic
import UnlockModal from '~/components/project/UnlockModal.vue'
const showUnlockModal = ref(false)
const unlockLoading = ref(false)
const { user, refreshUser } = useAuth()

const handleUnlockRequest = () => {
  if (!user.value) {
    return navigateTo(`/login?redirect=${route.fullPath}`)
  }
  showUnlockModal.value = true
}

const handleConfirmUnlock = async () => {
    if (!project.value) return
    
    unlockLoading.value = true
    try {
        const response = await $fetch<{ success: boolean; message?: string }>('/api/unlock/purchase', {
            method: 'POST',
            body: { targetUserId: project.value.user_id }
        })
        
        if (!response.success) throw new Error(response.message || 'Unlock failed')

        showUnlockModal.value = false
        // Refresh project data to show unlocked content
        await refresh()
        // Refresh user to update credits
        await refreshUser()
    } catch (e: any) {
        alert(e.message || 'Unlock failed')
    } finally {
        unlockLoading.value = false
    }
}

const handleRecharge = () => {
    navigateTo('/me/recharge')
}

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

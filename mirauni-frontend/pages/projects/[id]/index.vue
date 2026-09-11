<template>
  <div class="container mx-auto px-4 py-10 md:py-12">
    <div v-if="pending" class="border-3 border-black bg-gray-50 py-16 text-center text-xl font-black">加载项目中...</div>
    <div v-else-if="error" class="border-3 border-red-600 bg-red-100 p-8 text-center font-bold text-red-700">
      项目加载失败：{{ error.message }}
    </div>
    <template v-else-if="project">
      <CuratedProjectDetail v-if="isCurated" :project="project" />
      <BrutalistTheme v-else :project="project" @unlock="handleUnlockRequest" />

      <ClientOnly v-if="isRecruitingOwner">
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
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types'
import BrutalistTheme from '~/components/project/theme/Brutalist.vue'
import CuratedProjectDetail from '~/components/project/CuratedProjectDetail.vue'
import UnlockModal from '~/components/project/UnlockModal.vue'

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
const { t } = useI18n()
const { data, pending, error, refresh } = await useFetch<ProjectDetailResponse>(`/api/projects/${route.params.id}`)
const project = computed(() => data.value?.data)
const isCurated = computed(() => project.value?.listing_type === 'curated')
const isRecruitingOwner = computed(() => project.value?.listing_type === 'owner' && project.value?.is_recruiting)

const showUnlockModal = ref(false)
const unlockLoading = ref(false)
const { user, refreshUser } = useAuth()

const handleUnlockRequest = () => {
  if (!isRecruitingOwner.value || !project.value) return
  if (!user.value) return navigateTo(`/login?redirect=${route.fullPath}`)
  showUnlockModal.value = true
}

const handleConfirmUnlock = async () => {
  if (!project.value || !isRecruitingOwner.value) return

  unlockLoading.value = true
  try {
    const response = await $fetch<{ success: boolean; message?: string }>('/api/unlock/purchase', {
      method: 'POST',
      body: { targetUserId: project.value.user_id }
    })
    if (!response.success) throw new Error(response.message || 'Unlock failed')

    showUnlockModal.value = false
    await refresh()
    await refreshUser()
  } catch (e: any) {
    alert(e.message || 'Unlock failed')
  } finally {
    unlockLoading.value = false
  }
}

const handleRecharge = () => navigateTo('/me/recharge')

const resolveOgImage = useOgImageResolver()
const ogImage = computed(() => resolveOgImage())

useSeoMeta({
  title: () => project.value
    ? (isCurated.value ? `${project.value.title}｜小概率精选项目` : `${project.value.title}｜项目广场 - ${t('common.appName')}`)
    : '项目广场 - 小概率',
  description: () => project.value?.summary || '浏览真实独立产品和正在寻找合作伙伴的项目。',
  keywords: () => project.value
    ? [project.value.title, project.value.industry, project.value.category, ...(isRecruitingOwner.value ? project.value.roles_needed || [] : [])].filter(Boolean).join(',')
    : '独立产品,项目广场',
  ogTitle: () => project.value?.title || '项目广场',
  ogDescription: () => project.value?.summary,
  ogImage: () => ogImage.value,
  ogType: 'article',
  robots: () => isCurated.value ? 'noindex, follow' : 'index, follow'
})

useCanonical(`/projects/${route.params.id}`)

const breadcrumbStructuredData = computed(() => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '首页', item: 'https://mirauni.com/' },
    { '@type': 'ListItem', position: 2, name: '项目广场', item: 'https://mirauni.com/projects' },
    { '@type': 'ListItem', position: 3, name: project.value?.title || '项目详情', item: `https://mirauni.com/projects/${route.params.id}` }
  ]
}))

const jobPostingStructuredData = computed(() => {
  if (!isRecruitingOwner.value || !project.value) return null
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: project.value.title,
    description: project.value.summary,
    datePosted: project.value.created_at,
    employmentType: project.value.work_mode === 'remote' ? 'CONTRACTOR' : 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: t('common.appName'),
      url: 'https://mirauni.com'
    },
    jobLocation: project.value.work_mode === 'remote'
      ? { '@type': 'VirtualLocation', url: `https://mirauni.com/projects/${project.value.id}` }
      : { '@type': 'Place', address: 'China' }
  })
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: breadcrumbStructuredData.value
    },
    ...(jobPostingStructuredData.value ? [{
      type: 'application/ld+json',
      innerHTML: jobPostingStructuredData.value
    }] : [])
  ]
}))

const { trackProjectView } = useTrack()
onMounted(() => {
  if (project.value?.id) trackProjectView(project.value.id)
})
</script>

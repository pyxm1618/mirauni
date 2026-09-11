<template>
  <NuxtLink
    :to="localePath('/projects/' + project.id)"
    class="group relative flex h-full flex-col border-3 border-black bg-white p-5 pb-16 shadow-brutal transition-all hover:-translate-y-1 hover:shadow-brutal-lg"
  >
    <div class="mb-5 flex items-start justify-between gap-4">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center border-3 border-black text-sm font-black uppercase shadow-[3px_3px_0_0_#000]"
        :class="markClass"
        aria-hidden="true"
      >
        {{ projectMark }}
      </div>
      <span
        class="border-2 border-black px-2.5 py-1 text-[11px] font-black"
        :class="isCurated ? 'bg-black text-white' : 'bg-indie-primary text-black'"
      >
        {{ isCurated ? '平台精选' : '项目方发布' }}
      </span>
    </div>

    <h3 class="mb-2 text-xl font-black leading-tight group-hover:underline group-hover:decoration-4 group-hover:decoration-indie-accent">
      {{ project.title }}
    </h3>

    <p class="mb-5 ml-1 line-clamp-3 flex-grow border-l-2 border-black pl-3 text-sm font-medium leading-6 text-gray-600">
      {{ project.summary }}
    </p>

    <div class="mb-4 flex flex-wrap gap-2">
      <span v-if="project.industry" class="border border-black bg-indie-secondary/30 px-2 py-1 text-[10px] font-black">
        {{ getIndustryLabel(project.industry) }}
      </span>
      <span class="border border-black bg-gray-100 px-2 py-1 text-[10px] font-black">
        {{ getCategoryLabel(project.category) }}
      </span>
      <span v-if="isCurated" class="border border-black bg-white px-2 py-1 text-[10px] font-black">开源项目</span>
      <span v-if="isRecruitingOwner" class="border border-black bg-indie-primary px-2 py-1 text-[10px] font-black">开放合作</span>
    </div>

    <div v-if="isRecruitingOwner && project.roles_needed?.length" class="mb-4 text-xs font-bold text-gray-600">
      寻找：{{ project.roles_needed.map(getRoleLabel).join(' / ') }}
    </div>

    <div class="absolute bottom-5 left-5 right-5 flex items-center justify-between border-t-2 border-black pt-3 text-xs font-black">
      <span class="text-gray-500">{{ isCurated ? '来源 GitHub' : (project.is_recruiting ? '正在招募' : '项目展示') }}</span>
      <span class="transition-transform group-hover:translate-x-1">查看项目 →</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Project } from '~/types'
import { PROJECT_CATEGORIES, PROJECT_INDUSTRIES, ROLES } from '~/types'

const props = defineProps<{ project: Project }>()
const localePath = useLocalePath()

const isCurated = computed(() => props.project.listing_type === 'curated')
const isRecruitingOwner = computed(() => props.project.listing_type === 'owner' && props.project.is_recruiting)

const projectMark = computed(() => {
  const words = props.project.title.trim().split(/[\s.\-_]+/).filter(Boolean)
  if (words.length > 1) return words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
  return props.project.title.replace(/[^A-Za-z0-9\u4e00-\u9fff]/g, '').slice(0, 2).toUpperCase() || 'P'
})

const markClass = computed(() => {
  const seed = [...props.project.title].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4
  return ['bg-indie-primary', 'bg-indie-secondary', 'bg-indie-accent', 'bg-white'][seed]
})

const getCategoryLabel = (value: string) => PROJECT_CATEGORIES.find(item => item.value === value)?.label || value
const getIndustryLabel = (value: string) => PROJECT_INDUSTRIES.find(item => item.value === value)?.label || value
const getRoleLabel = (value: string) => ROLES.find(item => item.value === value)?.label || value
</script>

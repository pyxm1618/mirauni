<template>
  <div class="bg-white border-2 border-indie-border shadow-brutal p-6 hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer" @click="navigateTo(`/projects/${project.id}`)">
    <div class="flex items-center gap-2 mb-3">
      <span class="px-2 py-1 bg-indie-secondary text-sm border border-indie-border">
        {{ getCategoryLabel(project.category) }}
      </span>
      <span class="px-2 py-1 bg-gray-100 text-sm border border-gray-300">
        {{ getWorkModeLabel(project.work_mode) }}
      </span>
    </div>
    <h3 class="text-xl font-bold mb-2">{{ project.title }}</h3>
    <p class="text-gray-600 mb-4 line-clamp-2 h-12">{{ project.summary }}</p>
    <div class="flex flex-wrap gap-2 mb-4">
      <span v-for="role in project.roles_needed" :key="role" class="px-2 py-1 bg-indie-primary text-sm">
        招募：{{ getRoleLabel(role) }}
      </span>
    </div>
    <div class="flex items-center justify-between mt-auto">
        <div class="text-sm text-gray-500">
            {{ getCooperationLabel(project.cooperation_type) }} · 发布于 {{ formatDate(project.created_at) }}
        </div>
        <div class="flex items-center gap-2" v-if="project.user">
             <img :src="project.user.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + project.user.username" class="w-6 h-6 rounded-full border border-black bg-gray-100" />
             <span class="text-sm font-medium">{{ project.user.username }}</span>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types'
import { PROJECT_CATEGORIES, WORK_MODES, COOPERATION_TYPES, ROLES } from '~/types'

const props = defineProps<{
  project: Project
}>()

const getCategoryLabel = (val: string) => PROJECT_CATEGORIES.find(c => c.value === val)?.label || val
const getWorkModeLabel = (val: string) => WORK_MODES.find(c => c.value === val)?.label || val
const getRoleLabel = (val: string) => ROLES.find(c => c.value === val)?.label || val
const getCooperationLabel = (val: string) => COOPERATION_TYPES.find(c => c.value === val)?.label || val

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = (now.getTime() - date.getTime()) / 1000 // seconds

    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`
    return date.toLocaleDateString()
}
</script>

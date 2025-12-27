<template>
  <div class="bg-white border-3 border-black p-5 shadow-brutal hover:shadow-brutal-lg transition-all hover:-translate-y-1 flex flex-col h-full group pb-16 relative" @click="navigateTo(`/projects/${project.id}`)">
    <!-- Header -->
    <div class="flex justify-between items-start mb-4">
        <div class="w-10 h-10 border-3 border-black flex items-center justify-center font-bold bg-indie-primary">
             <img v-if="project.user?.avatar_url" :src="project.user.avatar_url" class="w-full h-full object-cover border-2 border-black" />
             <span v-else>{{ project.user?.username?.[0]?.toUpperCase() || 'U' }}</span>
        </div>
        <div class="bg-black text-white px-2 py-0.5 text-xs font-bold font-mono">ID:{{ project.id.toString().padStart(3, '0') }}</div>
    </div>

    <!-- Title -->
    <h3 class="text-xl font-black uppercase leading-tight mb-2 group-hover:underline decoration-4 decoration-indie-accent cursor-pointer line-clamp-2">
        {{ project.title }}
    </h3>

    <!-- Description -->
    <p class="text-sm font-medium text-gray-600 mb-4 flex-grow border-l-2 border-black pl-3 ml-1 line-clamp-3">
        {{ project.summary }}
    </p>

    <!-- Tags -->
    <div class="flex flex-wrap gap-1 mb-4">
      <span class="border border-black px-1.5 py-0.5 text-[10px] font-bold uppercase bg-gray-100">
        {{ getCategoryLabel(project.category) }}
      </span>
      <span v-for="role in project.roles_needed" :key="role" class="border border-black px-1.5 py-0.5 text-[10px] font-bold uppercase bg-indie-secondary/30">
        NEEDED: {{ getRoleLabel(role) }}
      </span>
    </div>

    <!-- Action Button (Absolute Bottom) -->
    <div class="absolute bottom-5 left-5 right-5">
        <button class="w-full border-3 border-black py-2 font-black text-sm hover:bg-indie-primary hover:shadow-brutal-hover transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-white uppercase">
            VIEW_DETAILS
        </button>
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

<template>
  <article class="mx-auto max-w-5xl">
    <NuxtLink to="/projects" class="mb-7 inline-block border-b-2 border-black px-1 font-black hover:bg-black hover:text-white">← 返回项目广场</NuxtLink>

    <header class="mb-10 border-3 border-black bg-white p-6 shadow-brutal md:p-9">
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <span class="border-2 border-black bg-indie-primary px-3 py-1 text-xs font-black shadow-[2px_2px_0_0_#000]">项目方发布</span>
        <span v-if="project.industry" class="border-2 border-black bg-indie-secondary/30 px-3 py-1 text-xs font-black">{{ getIndustryLabel(project.industry) }}</span>
        <span class="border-2 border-black bg-white px-3 py-1 text-xs font-black">{{ getCategoryLabel(project.category) }}</span>
        <span v-if="project.is_recruiting && project.work_mode" class="border-2 border-black bg-white px-3 py-1 text-xs font-black">{{ getWorkModeLabel(project.work_mode) }}</span>
        <span :class="project.is_recruiting ? 'bg-black text-white' : 'bg-gray-100 text-black'" class="border-2 border-black px-3 py-1 text-xs font-black">
          {{ project.is_recruiting ? '开放合作' : '项目展示' }}
        </span>
        <span v-if="project.status !== 'active'" class="border-2 border-black bg-red-500 px-2 py-1 text-xs font-black text-white">
          {{ project.status === 'closed' ? '已关闭' : '待审核' }}
        </span>
      </div>

      <h1 class="mb-6 text-4xl font-display font-black leading-tight md:text-7xl">{{ project.title }}</h1>
      <p class="mb-8 max-w-4xl border-l-4 border-black pl-5 text-lg font-bold leading-8 text-gray-700 md:text-xl">{{ project.summary }}</p>

      <div class="flex flex-col gap-6 border-t-4 border-black pt-7 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="absolute inset-0 translate-x-1 translate-y-1 rounded-full bg-black"></div>
            <img :src="project.users?.avatar_url || fallbackAvatar" :alt="project.users?.username || '项目发布者'" width="64" height="64" decoding="async" class="relative z-10 h-16 w-16 rounded-full border-3 border-black bg-white" />
          </div>
          <div>
            <div class="text-xl font-black">{{ project.users?.username || '项目发布者' }}</div>
            <div class="text-xs font-black tracking-[0.16em] text-gray-500">PROJECT OWNER</div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <NuxtLink v-if="project.is_owner" :to="`/projects/${project.id}/edit`" class="border-3 border-black bg-white px-5 py-3 text-center font-black hover:-translate-y-1 hover:shadow-brutal transition-all">编辑项目</NuxtLink>
          <button v-if="project.is_recruiting && !project.is_owner" type="button" @click="$emit('unlock')" class="border-3 border-black bg-black px-5 py-3 font-black text-white shadow-brutal transition-all hover:-translate-y-1 hover:bg-indie-primary hover:text-black">
            {{ project.is_unlocked ? '查看项目方联系方式' : '解锁项目方联系方式' }}
          </button>
        </div>
      </div>
    </header>

    <div class="grid gap-7">
      <section v-if="project.is_recruiting" class="relative overflow-hidden border-3 border-black bg-indie-primary p-6 shadow-brutal md:p-8">
        <div class="mb-5 text-xs font-black tracking-[0.18em]">COLLABORATION</div>
        <h2 class="mb-6 inline-block border-b-4 border-black text-2xl font-black md:text-3xl">正在寻找</h2>

        <div v-if="project.roles_needed?.length" class="mb-6 flex flex-wrap gap-3">
          <span v-for="role in project.roles_needed" :key="role" class="border-2 border-black bg-white px-3 py-2 text-sm font-black shadow-[3px_3px_0_0_#000]">
            {{ getRoleLabel(role) }}
          </span>
        </div>

        <div v-if="project.skills_required?.length" class="mb-6">
          <div class="mb-2 text-xs font-black tracking-widest">期望技能</div>
          <div class="flex flex-wrap gap-2">
            <span v-for="skill in project.skills_required" :key="skill" class="border-2 border-black bg-white px-2 py-1 text-sm font-bold">{{ skill }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 text-sm font-bold">
          <span v-if="project.work_mode" class="border-2 border-black bg-black px-3 py-2 text-white">{{ getWorkModeLabel(project.work_mode) }}</span>
          <span v-if="project.cooperation_type" class="border-2 border-black bg-white px-3 py-2">{{ getCooperationLabel(project.cooperation_type) }}</span>
        </div>
      </section>

      <section class="border-3 border-black bg-white p-6 shadow-brutal md:p-8">
        <div class="mb-5 text-xs font-black tracking-[0.18em] text-gray-500">PROJECT DETAILS</div>
        <h2 class="mb-6 inline-block border-b-4 border-black text-2xl font-black md:text-3xl">项目介绍</h2>
        <p v-if="project.description" class="whitespace-pre-wrap text-base font-medium leading-8 text-gray-800 md:text-lg">{{ project.description }}</p>
        <div v-else class="border-2 border-dashed border-black bg-gray-50 p-8 text-center font-bold text-gray-500">项目方暂未公开详细介绍。</div>
      </section>

      <section v-if="project.demo_url" class="flex flex-col gap-4 border-3 border-black bg-indie-accent p-6 shadow-brutal md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <div class="mb-1 text-xs font-black tracking-[0.18em]">LIVE PRODUCT</div>
          <h2 class="text-2xl font-black">看看实际产品</h2>
        </div>
        <a :href="project.demo_url" target="_blank" rel="noopener noreferrer" class="max-w-full truncate border-3 border-black bg-white px-5 py-3 text-center font-black shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">访问项目 ↗</a>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { PROJECT_CATEGORIES, PROJECT_INDUSTRIES, WORK_MODES, ROLES, COOPERATION_TYPES } from '~/types'

const props = defineProps<{ project: any }>()
defineEmits(['unlock'])

const fallbackAvatar = computed(() => `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(props.project.users?.username || 'project')}`)
const getCategoryLabel = (value: string) => PROJECT_CATEGORIES.find(item => item.value === value)?.label || value
const getIndustryLabel = (value: string) => PROJECT_INDUSTRIES.find(item => item.value === value)?.label || value
const getWorkModeLabel = (value: string) => WORK_MODES.find(item => item.value === value)?.label || value
const getRoleLabel = (value: string) => ROLES.find(item => item.value === value)?.label || value
const getCooperationLabel = (value: string) => COOPERATION_TYPES.find(item => item.value === value)?.label || value
</script>

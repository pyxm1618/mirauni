<template>
  <div class="max-w-4xl mx-auto font-sans text-gray-900">
    <!-- Header -->
    <div class="mb-16 border-b border-gray-200 pb-12">
      <NuxtLink to="/projects" class="text-sm font-medium text-gray-500 hover:text-black mb-8 inline-block transition-colors">← Back to Projects</NuxtLink>
      
      <div class="flex flex-wrap items-center gap-4 mb-6">
          <span class="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">{{ getCategoryLabel(project.category) }}</span>
          <span class="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">{{ getWorkModeLabel(project.work_mode) }}</span>
          <span class="text-gray-400 text-xs ml-auto">{{ formatDate(project.created_at) }}</span>
      </div>
      
      <h1 class="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight text-gray-900">{{ project.title }}</h1>
      <p class="text-xl md:text-2xl text-gray-600 font-light leading-relaxed mb-8">{{ project.summary }}</p>
      
      <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
             <img :src="project.users.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + project.users.username" class="w-10 h-10 rounded-full bg-gray-100" />
             <div>
                <div class="font-medium text-sm">{{ project.users.username }}</div>
             </div>
          </div>
          
          <div class="flex gap-3">
              <NuxtLink v-if="project.is_owner" :to="`/projects/${project.id}/edit`" class="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                {{ $t('common.edit') }}
              </NuxtLink>
              <button @click="$emit('unlock')" class="px-5 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                {{ project.is_unlocked || project.is_owner ? $t('project.unlock.contactOwner') : $t('project.unlock.unlockContact') }}
              </button>
          </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <!-- Main Content -->
        <div class="md:col-span-2 space-y-12">
            <section>
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">About this project</h3>
                <div v-if="project.description" class="prose prose-lg prose-gray max-w-none">
                    {{ project.description }}
                </div>
                <div v-else class="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                    <p class="text-gray-400 font-medium mb-3">{{ $t('project.unlock.lockedContent') }}</p>
                    <button @click="$emit('unlock')" class="text-sm font-medium text-black border-b border-black pb-0.5 hover:opacity-70">{{ $t('project.unlock.unlockToView') }}</button>
                </div>
            </section>
        </div>
        
        <!-- Sidebar -->
        <div class="space-y-8">
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 class="text-sm font-semibold mb-4 text-gray-900">Looking For</h3>
                <div class="flex flex-wrap gap-2 mb-6">
                    <span v-for="role in project.roles_needed" :key="role" class="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700">
                      {{ getRoleLabel(role) }}
                    </span>
                </div>
                
                <div v-if="project.skills_required?.length">
                    <h4 class="text-xs font-medium text-gray-500 mb-3 mt-6">Required Skills</h4>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="skill in project.skills_required" :key="skill" class="bg-white px-2 py-1 text-xs border border-gray-200 rounded text-gray-600">
                            {{ skill }}
                        </span>
                    </div>
                </div>

                <div class="mt-8 pt-6 border-t border-gray-200">
                    <h4 class="text-xs font-medium text-gray-500 mb-2">Cooperation</h4>
                    <div class="font-medium text-gray-900">{{ getCooperationLabel(project.cooperation_type) }}</div>
                </div>
            </div>

            <div v-if="project.demo_url" class="text-center">
                <a :href="project.demo_url" target="_blank" class="block w-full py-3 border border-gray-200 rounded-xl text-sm font-medium hover:border-gray-900 transition-colors">
                    Visit Live Demo ↗
                </a>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PROJECT_CATEGORIES, WORK_MODES, ROLES, COOPERATION_TYPES } from '~/types'

defineProps<{
  project: any
}>()

const emit = defineEmits(['unlock'])

const { t } = useI18n()
const localePath = useLocalePath()

const getCategoryLabel = (val: string) => t('project.categories.' + val)
const getWorkModeLabel = (val: string) => t('project.workModes.' + val)
const getRoleLabel = (val: string) => t('roles.' + val)
const getCooperationLabel = (val: string) => t('project.cooperationTypes.' + val)

const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="mb-12">
      <NuxtLink to="/projects" class="inline-block mb-6 font-bold uppercase border-b-2 border-black hover:bg-black hover:text-white transition-all px-1">← BACK_TO_LIST</NuxtLink>
      
      <div class="flex flex-wrap items-center gap-3 mb-6">
          <span class="px-3 py-1 bg-indie-secondary border-2 border-black text-sm font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{{ getCategoryLabel(project.category) }}</span>
          <span class="px-3 py-1 bg-white border-2 border-black text-sm font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{{ getWorkModeLabel(project.work_mode) }}</span>
          <span class="text-gray-500 text-sm font-bold uppercase px-2 border-l-2 border-black ml-2">POSTED: {{ formatDate(project.created_at) }}</span>
          <span v-if="project.status !== 'active'" class="px-2 py-1 bg-red-500 text-white text-xs border-2 border-black font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {{ project.status === 'closed' ? 'CLOSED' : 'PENDING' }}
          </span>
      </div>
      
      <h1 class="text-5xl md:text-7xl font-black font-display mb-8 uppercase leading-tight tracking-tight">{{ project.title }}</h1>
      <div class="p-6 bg-white border-3 border-black shadow-brutal mb-8">
            <p class="text-xl md:text-2xl text-black font-bold font-mono leading-relaxed">"{{ project.summary }}"</p>
      </div>
      
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 border-t-4 border-black pt-8">
          <div class="flex items-center gap-4 w-full md:w-auto">
              <div class="relative">
                <div class="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-full"></div>
                <img :src="project.users.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + project.users.username" class="relative w-16 h-16 rounded-full border-3 border-black bg-white z-10" />
              </div>
              <div>
                <div class="font-black text-xl uppercase">{{ project.users.username }}</div>
                <div class="text-sm font-bold text-gray-500 uppercase">PROJECT_OWNER</div>
              </div>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-4 w-full md:w-auto">
              <NuxtLink v-if="project.is_owner" :to="`/projects/${project.id}/edit`" class="flex-1 md:flex-none px-6 py-3 bg-white border-3 border-black font-black uppercase hover:shadow-brutal hover:-translate-y-1 transition-all text-center">
                {{ $t('common.edit') }}
              </NuxtLink>
              <button @click="$emit('unlock')" class="flex-1 md:flex-none bg-black text-white border-3 border-black px-6 py-3 font-black uppercase hover:bg-indie-primary hover:text-black hover:shadow-brutal hover:-translate-y-1 transition-all shadow-brutal">
                {{ project.is_unlocked || project.is_owner ? $t('project.unlock.contactOwner') : $t('project.unlock.unlockContact') }}
              </button>
          </div>
      </div>
    </div>
    
    <!-- Content Cards -->
    <div class="grid gap-8">
        <!-- Basic Info -->
        <div class="bg-white border-3 border-black shadow-brutal p-8 relative overflow-hidden group">
          <div class="absolute top-0 left-0 w-3 h-full bg-indie-primary group-hover:w-full transition-all duration-500 opacity-20"></div>
          <h3 class="text-3xl font-black mb-6 uppercase inline-block border-b-4 border-black relative z-10">REQUIREMENTS</h3>
          
          <div class="relative z-10">
              <div class="flex flex-wrap gap-3 mb-6">
                  <span v-for="role in project.roles_needed" :key="role" class="px-3 py-1 bg-indie-primary text-base font-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">
                    NEEDED: {{ getRoleLabel(role) }}
                  </span>
              </div>
              <div v-if="project.skills_required?.length" class="mb-6">
                  <span class="font-bold block mb-2 uppercase text-sm tracking-wider">REQUIRED SKILLS:</span>
                  <div class="flex flex-wrap gap-2">
                      <span v-for="skill in project.skills_required" :key="skill" class="bg-white px-3 py-1 text-sm border-2 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
                          {{ skill }}
                      </span>
                  </div>
              </div>
              <div class="flex items-center gap-2">
                  <span class="font-bold uppercase text-sm tracking-wider">COOPERATION TYPE:</span>
                  <span class="font-black text-lg bg-black text-white px-2 uppercase">{{ getCooperationLabel(project.cooperation_type) }}</span>
              </div>
          </div>
        </div>
        
        <!-- Detail (Description) -->
        <div class="bg-white border-3 border-black shadow-brutal p-8">
          <h3 class="text-3xl font-black mb-8 border-b-4 border-black inline-block uppercase">DETAILS</h3>
          <div v-if="project.description" class="prose max-w-none whitespace-pre-wrap leading-relaxed font-medium text-lg text-gray-800 font-mono">
              {{ project.description }}
          </div>
          <div v-else class="text-center py-16 text-gray-500 bg-gray-50 border-3 border-dashed border-gray-400">
              <p class="mb-6 text-2xl font-black uppercase opacity-50">🔒 {{ $t('project.unlock.lockedContent') }}</p>
              <button @click="$emit('unlock')" class="bg-white border-3 border-black px-6 py-3 font-black uppercase hover:shadow-brutal hover:-translate-y-1 transition-all">{{ $t('project.unlock.unlockToView') }}</button>
          </div>
        </div>

        <!-- Demo Link -->
        <div class="bg-indie-accent border-3 border-black shadow-brutal p-8 flex flex-col md:flex-row items-center justify-between gap-4" v-if="project.demo_url">
            <h3 class="text-2xl font-black uppercase">LIVE DEMO</h3>
            <a :href="project.demo_url" target="_blank" class="bg-white text-black border-3 border-black px-6 py-2 font-black uppercase hover:shadow-brutal hover:-translate-y-1 transition-all truncate max-w-xs md:max-w-md block text-center">
                {{ project.demo_url }} ↗
            </a>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PROJECT_CATEGORIES, WORK_MODES, ROLES, COOPERATION_TYPES } from '~/types'

const props = defineProps<{
  project: any
}>()

const emit = defineEmits(['unlock'])

const { t } = useI18n()
const localePath = useLocalePath()

const getCategoryLabel = (val: string) => t('project.categories.' + val)
const getWorkModeLabel = (val: string) => t('project.workModes.' + val)
const getRoleLabel = (val: string) => t('roles.' + val)
const getCooperationLabel = (val: string) => t('project.cooperationTypes.' + val)

const formatDate = (date: string) => new Date(date).toLocaleDateString()
</script>

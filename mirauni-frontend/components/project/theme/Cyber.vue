<template>
  <div class="bg-gray-900 text-green-400 font-mono p-4 md:p-8 min-h-screen -mx-4 -my-12 py-12">
    <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="mb-12 border-b border-green-800 pb-8 flex flex-col gap-6">
            <div class="flex justify-between items-center text-xs opacity-70">
                <span>SYSTEM_ID: {{ project.id.split('-')[0] }}</span>
                <span>STATUS: {{ project.status === 'active' ? 'ONLINE' : 'OFFLINE' }}</span>
            </div>

            <NuxtLink to="/projects" class="text-green-500 hover:text-green-300 transition-colors inline-block w-fit">
                &lt; COMMAND: RETURN_TO_BASE
            </NuxtLink>
            
            <div class="flex flex-wrap gap-2">
                <span class="px-2 py-0.5 border border-green-600 text-xs text-green-400 uppercase">[{{ getCategoryLabel(project.category) }}]</span>
                <span class="px-2 py-0.5 border border-green-600 text-xs text-green-400 uppercase">[{{ getWorkModeLabel(project.work_mode) }}]</span>
            </div>
            
            <h1 class="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 uppercase tracking-tighter loading-text">
                {{ project.title }}<span class="animate-pulse">_</span>
            </h1>
            
            <div class="border-l-2 border-green-500 pl-4 py-2 bg-green-900/10">
                <p class="text-xl text-green-300">"{{ project.summary }}"</p>
            </div>
            
            <div class="flex items-center justify-between pt-4">
                <div class="flex items-center gap-4">
                     <div class="relative">
                        <div class="absolute inset-0 bg-green-500 blur opacity-50 rounded-full"></div>
                        <img :src="project.users.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + project.users.username" class="relative w-12 h-12 rounded-full border border-green-500 bg-gray-900 z-10 grayscale hover:grayscale-0 transition-all" />
                     </div>
                     <div class="flex flex-col">
                        <span class="text-xs text-green-600">USER_HANDLE</span>
                        <span class="font-bold text-green-400">@{{ project.users.username }}</span>
                     </div>
                </div>
                
                <div class="flex gap-4">
                    <NuxtLink v-if="project.is_owner" :to="`/projects/${project.id}/edit`" class="px-6 py-2 border border-green-500 text-green-400 hover:bg-green-500 hover:text-gray-900 transition-all uppercase text-sm">
                        EXECUTE: {{ $t('common.edit') }}
                    </NuxtLink>
                    <button @click="$emit('unlock')" class="px-6 py-2 bg-green-600 text-gray-900 font-bold hover:bg-green-400 hover:shadow-[0_0_15px_rgba(74,222,128,0.5)] transition-all uppercase text-sm">
                        {{ project.is_unlocked || project.is_owner ? `INIT: ${$t('project.unlock.contactOwner')}` : `DECRYPT: ${$t('project.unlock.unlockContact')}` }}
                    </button>
                </div>
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Data Block (Sidebar) -->
            <div class="space-y-6">
                <!-- ... -->
            </div>
            
            <!-- Main Data Stream -->
            <div class="lg:col-span-2">
                <div class="border-t border-r border-green-800 p-6 md:pl-8 min-h-[400px] relative">
                    <!-- Corner markers -->
                    <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-green-500"></div>
                    <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-green-500"></div>
                    
                    <h3 class="text-green-500 text-lg font-bold mb-6 font-mono">> DATA_LOG: DESCRIPTION</h3>
                    
                    <div v-if="project.description" class="prose prose-invert max-w-none prose-p:text-green-300 prose-headings:text-green-400 font-mono text-sm leading-relaxed">
                        {{ project.description }}
                    </div>
                    <div v-else class="text-center py-20 border border-dashed border-green-900 bg-black/20">
                        <p class="text-red-500 blink mb-4">ACCESS DENIED: DATA ENCRYPTED</p>
                        <button @click="$emit('unlock')" class="border border-green-500 text-green-500 px-4 py-2 text-sm hover:bg-green-500 hover:text-black transition-colors">INITIATE DECRYPTION ROUTINE</button>
                    </div>
                </div>
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

const getCategoryLabel = (val: string) => PROJECT_CATEGORIES.find(c => c.value === val)?.label || val
const getWorkModeLabel = (val: string) => WORK_MODES.find(c => c.value === val)?.label || val
const getRoleLabel = (val: string) => ROLES.find(c => c.value === val)?.label || val
const getCooperationLabel = (val: string) => COOPERATION_TYPES.find(c => c.value === val)?.label || val
</script>

<style scoped>
.loading-text::after {
  content: '|';
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>

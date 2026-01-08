<template>
  <div class="relative group h-full">
    <!-- Shadow/Background Element -->
    <div class="absolute inset-0 bg-black translate-x-3 translate-y-3"></div>
    
    <!-- Card Content -->
    <div class="relative bg-white border-3 border-black p-6 h-full flex flex-col transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1" @click="navigateTo(`/developers/${developer.id}`)">
        <!-- Header -->
        <div class="flex justify-between items-start mb-4 border-b-3 border-black pb-4">
            <div>
                <h2 class="text-2xl font-black uppercase leading-none mb-1">{{ developer.username }}</h2>
                <div class="text-indie-primary font-black bg-black text-white inline-block px-1 text-xs uppercase">{{ developer.profession || 'DEV' }}</div>
            </div>
            <div class="text-xl font-bold font-mono">{{ developer.experience_years ? `${developer.experience_years}Y EXP` : 'NEW' }}</div>
        </div>
        
        <!-- Bio -->
        <p class="font-bold text-gray-600 mb-6 flex-grow line-clamp-3">"{{ developer.bio || 'Ready to build something amazing.' }}"</p>
        
        <!-- Skills -->
        <div class="flex flex-wrap gap-2 mb-6">
            <span v-for="skill in (developer.skills || []).slice(0, 4)" :key="skill" class="bg-gray-200 border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                {{ skill }}
            </span>
        </div>
        
        <!-- Action -->
        <button class="w-full border-3 border-black py-3 font-black text-lg transition-all flex items-center justify-center gap-2 bg-indie-secondary hover:bg-indie-accent active:translate-y-1 active:translate-x-1 uppercase">
            VIEW PROFILE
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  developer: any
}>()

const getPreferenceLabel = (pref: string) => {
  const key = `me.profile.${pref}`
  // 检查翻译是否存在，不存在则回退到默认
  return t(key) === key ? pref : t(key)
}
</script>

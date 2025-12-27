<template>
  <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col h-full">
    <div class="flex items-start gap-4 mb-4">
      <img 
        :src="developer.avatar_url || 'https://via.placeholder.com/150'" 
        alt="Avatar" 
        class="w-16 h-16 rounded-full object-cover border border-gray-200"
      />
      <div>
        <h3 class="text-lg font-bold text-gray-900 line-clamp-1">
          <NuxtLink :to="`/developers/${developer.username}`" class="hover:text-primary-600 transition-colors">
            {{ developer.username }}
          </NuxtLink>
        </h3>
        <p class="text-sm text-gray-500 mb-1">
          {{ developer.profession || '独立开发者' }} 
          <span v-if="developer.position">· {{ developer.position }}</span>
        </p>
        <div class="flex items-center text-xs text-gray-400 gap-2">
          <span v-if="developer.location"><UIcon name="i-heroicons-map-pin" class="w-3 h-3" /> {{ developer.location }}</span>
          <span v-if="developer.experience_years"><UIcon name="i-heroicons-briefcase" class="w-3 h-3" /> {{ developer.experience_years }}年经验</span>
        </div>
      </div>
    </div>

    <div class="mb-4 flex-grow">
      <p class="text-gray-600 text-sm line-clamp-3">
        {{ developer.bio || '暂无简介' }}
      </p>
    </div>

    <div class="mt-auto">
      <div class="flex flex-wrap gap-2 mb-3">
        <span 
          v-for="skill in (developer.skills || []).slice(0, 5)" 
          :key="skill"
          class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
        >
          {{ skill }}
        </span>
        <span v-if="(developer.skills || []).length > 5" class="text-xs text-gray-400 self-center">
          +{{ developer.skills.length - 5 }}
        </span>
      </div>
      
      <div class="flex items-center justify-between border-t border-gray-50 pt-3">
         <span class="text-xs font-medium px-2 py-0.5 rounded-full" 
          :class="{
            'bg-green-50 text-green-600': developer.work_preference === 'fulltime',
            'bg-blue-50 text-blue-600': developer.work_preference === 'parttime',
            'bg-purple-50 text-purple-600': developer.work_preference === 'contract'
          }">
           {{ formatWorkPreference(developer.work_preference) }}
         </span>
         <NuxtLink 
           :to="`/developers/${developer.username}`"
           class="text-sm text-primary-600 hover:text-primary-700 font-medium"
         >
           查看详情 &rarr;
         </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  developer: any
}>()

const formatWorkPreference = (pref: string) => {
  const map: Record<string, string> = {
    fulltime: '全职',
    parttime: '兼职',
    contract: '外包/合约',
    freelance: '自由职业'
  }
  return map[pref] || '开放合作'
}
</script>

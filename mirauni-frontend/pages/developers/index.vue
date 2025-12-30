<template>
  <div class="min-h-screen bg-indie-bg py-8">
    <div class="container mx-auto px-4">
      <div class="mb-12">
        <h1 class="text-7xl font-black uppercase mb-6 tracking-tighter">{{ $t('developer.square.titleEn') }}<br><span class="text-4xl text-indie-secondary">{{ $t('developer.square.title') }}</span></h1>
        
        <div class="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between border-b-4 border-black pb-8">
            <!-- Brutalist Search -->
            <div class="w-full md:w-1/2">
                <label class="block font-black text-xl mb-2 bg-black text-white inline-block px-2">{{ $t('developer.square.find') }}</label>
                <div class="relative">
                    <div class="absolute inset-0 bg-indie-accent translate-x-2 translate-y-2 border-2 border-black"></div>
                    <input 
                      v-model="filters.keyword"
                      type="text" 
                      :placeholder="$t('developer.square.search')" 
                      class="relative w-full bg-white border-3 border-black p-4 font-bold text-xl focus:outline-none placeholder-gray-400 uppercase focus:translate-x-1 focus:translate-y-1 transition-transform"
                      @keyup.enter="() => refresh()"
                    />
                </div>
            </div>
            
            <!-- Skill Filter -->
            <div class="flex flex-wrap gap-2 justify-end">
                <button 
                v-for="opt in skillOptions" 
                :key="opt.value"
                @click="filters.skill = opt.value"
                class="border-3 border-black px-3 py-1 font-black text-sm uppercase transition-all hover:-translate-y-1"
                :class="(filters.skill === opt.value) ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' : 'bg-white text-black hover:bg-gray-100'"
                >
                    {{ opt.label }}
                </button>
            </div>
        </div>
      </div>

      <!-- Developer Grid -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="h-64 bg-white rounded-lg animate-pulse" />
      </div>

      <div v-else-if="developers?.data?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DeveloperCard 
          v-for="dev in developers.data" 
          :key="dev.id" 
          :developer="dev" 
        />
      </div>

      <div v-else class="text-center py-20 text-gray-500">
        <UIcon name="i-heroicons-user-group" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>{{ $t('developer.square.empty') }}</p>
        <UButton variant="link" @click="resetFilters">{{ $t('developer.square.reset') }}</UButton>
      </div>
      
      <!-- Pagination -->
      <div v-if="developers?.meta?.total > pageSize" class="flex justify-center mt-10">
        <UPagination 
          v-model="page" 
          :total="developers.meta.total" 
          :page-count="pageSize"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DeveloperCard from '~/components/developer/DeveloperCard.vue'

const page = ref(1)
const pageSize = 12
const { t } = useI18n()

// 技能选项
const skillOptions = computed(() => [
  { label: t('developer.square.allSkills'), value: '' },
  { label: t('skills.vue'), value: 'vue' },
  { label: t('skills.react'), value: 'react' },
  { label: t('skills.typescript'), value: 'typescript' },
  { label: t('skills.flutter'), value: 'flutter' },
  { label: t('skills.nodejs'), value: 'nodejs' },
  { label: t('skills.python'), value: 'python' },
  { label: t('skills.java'), value: 'java' },
  { label: t('skills.golang'), value: 'golang' },
  { label: t('skills.mysql'), value: 'mysql' },
  { label: t('skills.mongodb'), value: 'mongodb' },
  { label: t('skills.docker'), value: 'docker' },
  { label: t('skills.ai'), value: 'ai' }
])

const filters = reactive({
  keyword: '',
  location: '',
  work_preference: '',
  min_exp: '',
  skill: ''
})

const query = computed(() => ({
  page: page.value,
  pageSize,
  keyword: filters.keyword || undefined,
  location: filters.location || undefined,
  work_preference: filters.work_preference || undefined,
  min_exp: filters.min_exp || undefined,
  skill: filters.skill || undefined
}))

const { data: developers, pending, refresh } = await useFetch<any>('/api/developers/search', {
  query,
  watch: [page]
})

const resetFilters = () => {
  filters.keyword = ''
  filters.location = ''
  filters.work_preference = ''
  filters.min_exp = ''
  filters.skill = ''
  refresh()
}

useHead({
  title: t('developer.square.seoTitle'),
  meta: [
    { name: 'description', content: t('developer.square.seoDesc') }
  ]
})
</script>

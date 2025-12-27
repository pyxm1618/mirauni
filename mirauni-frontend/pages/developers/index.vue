<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 class="text-2xl font-bold text-gray-900">发现开发者</h1>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <UInput 
            v-model="filters.keyword"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="搜索名字、技能、简介..."
            @keyup.enter="refresh"
          />
          
          <UInput 
            v-model="filters.location"
            icon="i-heroicons-map-pin"
            placeholder="所在地"
            @keyup.enter="refresh"
          />
          
          <USelect 
            v-model="filters.skill"
            placeholder="选择技能"
            :options="skillOptions"
          />
          
          <USelect 
            v-model="filters.work_preference"
            placeholder="工作模式"
            :options="[
              { label: '全部模式', value: '' },
              { label: '全职', value: 'fulltime' },
              { label: '兼职', value: 'parttime' },
              { label: '自由职业', value: 'freelance' }
            ]"
          />
          
          <USelect 
             v-model="filters.min_exp"
             placeholder="经验要求"
             :options="[
               { label: '不限经验', value: '' },
               { label: '1年以上', value: '1' },
               { label: '3年以上', value: '3' },
               { label: '5年以上', value: '5' }
             ]"
          />
        </div>
        <div class="flex justify-end mt-4 gap-2">
          <UButton variant="ghost" @click="resetFilters">清除筛选</UButton>
          <UButton @click="refresh" color="primary">搜索</UButton>
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
        <p>没有找到匹配的开发者</p>
        <UButton variant="link" @click="resetFilters">清除筛选</UButton>
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

// 技能选项 (按文档定义)
const skillOptions = [
  { label: '全部技能', value: '' },
  { label: 'Vue.js', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Flutter', value: 'flutter' },
  { label: 'Node.js', value: 'nodejs' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'Go', value: 'golang' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'MongoDB', value: 'mongodb' },
  { label: 'Docker', value: 'docker' },
  { label: 'AI/ML', value: 'ai' }
]

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
  title: '发现开发者 - 小概率',
  meta: [
    { name: 'description', content: '寻找优秀的技术合伙人、独立开发者，支持按技能、经验、所在地筛选' }
  ]
})
</script>

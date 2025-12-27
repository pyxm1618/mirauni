<template>
  <NuxtLink 
    :to="`/projects/detail/${project.id}`"
    class="block bg-white border-2 border-indie-border shadow-brutal p-6 hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
  >
    <div class="flex items-center gap-2 mb-3">
      <span class="px-2 py-1 bg-indie-secondary text-sm border border-indie-border">
        {{ categoryLabel }}
      </span>
      <span class="px-2 py-1 bg-gray-100 text-sm border border-gray-300">
        {{ workModeLabel }}
      </span>
    </div>
    <h3 class="text-xl font-bold mb-2">{{ project.title }}</h3>
    <p class="text-gray-600 mb-4 line-clamp-2">{{ project.summary }}</p>
    <div class="flex flex-wrap gap-2 mb-4">
      <span 
        v-for="role in project.roles_needed?.slice(0, 3)" 
        :key="role"
        class="px-2 py-1 bg-indie-primary text-sm"
      >
        招募：{{ roleLabels[role] || role }}
      </span>
    </div>
    <div class="text-sm text-gray-500">
      {{ cooperationLabel }} · 发布于 {{ formatDate(project.created_at) }}
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Project {
  id: string
  title: string
  summary: string
  category: string
  roles_needed: string[]
  work_mode: string
  cooperation_type: string
  created_at: string
}

const props = defineProps<{
  project: Project
}>()

const categoryMap: Record<string, string> = {
  'saas': 'SaaS 工具',
  'app': '移动应用',
  'game': '游戏',
  'ai': 'AI / 人工智能',
  'ecommerce': '电商',
  'content': '内容/社区',
  'hardware': '智能硬件',
  'other': '其他'
}

const workModeMap: Record<string, string> = {
  'remote': '远程',
  'onsite': '坐班',
  'hybrid': '混合'
}

const cooperationMap: Record<string, string> = {
  'equity': '股权合作',
  'salary': '薪酬合作',
  'revenue_share': '收益分成',
  'volunteer': '纯兴趣'
}

const roleLabels: Record<string, string> = {
  'frontend': '前端开发',
  'backend': '后端开发',
  'fullstack': '全栈开发',
  'mobile': '移动端开发',
  'design': 'UI/UX 设计',
  'product': '产品经理',
  'operation': '运营',
  'marketing': '市场推广'
}

const categoryLabel = computed(() => categoryMap[props.project.category] || props.project.category)
const workModeLabel = computed(() => workModeMap[props.project.work_mode] || props.project.work_mode)
const cooperationLabel = computed(() => cooperationMap[props.project.cooperation_type] || props.project.cooperation_type)

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  return `${Math.floor(diffDays / 30)}个月前`
}
</script>

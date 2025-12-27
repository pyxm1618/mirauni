<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <div v-if="pending" class="container mx-auto px-4 py-8 animate-pulse">
      <div class="h-64 bg-white rounded-xl mb-6"></div>
    </div>
    
    <div v-else-if="developer" class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header / Profile Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div class="h-32 bg-gradient-to-r from-primary-500 to-indigo-600"></div>
        <div class="px-8 pb-8 relative">
          <div class="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
            <img 
              :src="developer.avatar_url || 'https://via.placeholder.com/150'" 
              class="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
            />
            <div class="flex-grow">
              <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ developer.username }}</h1>
              <p class="text-gray-600 mb-2">{{ developer.profession || '独立开发者' }} <span v-if="developer.position">| {{ developer.position }}</span></p>
              <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                <span v-if="developer.location"><UIcon name="i-heroicons-map-pin" /> {{ developer.location }}</span>
                <span v-if="developer.experience_years"><UIcon name="i-heroicons-briefcase" /> {{ developer.experience_years }}年经验</span>
                <span><UIcon name="i-heroicons-clock" /> 加入于 {{ new Date(developer.created_at).toLocaleDateString() }}</span>
              </div>
            </div>
            <div class="w-full md:w-auto flex gap-3 mt-4 md:mt-0">
               <!-- Actions -->
               <UnlockButton :target-user-id="developer.id" @unlocked="fetchContact">
                   <template #default="{ unlocked, onClick }">
                       <UButton v-if="!unlocked" @click="onClick" color="primary" icon="i-heroicons-lock-open">
                         解锁联系方式
                       </UButton>
                       <UButton v-else color="gray" variant="soft" icon="i-heroicons-check">已解锁</UButton>
                   </template>
               </UnlockButton>
            </div>
          </div>
          
          <!-- Bio -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">关于我</h2>
            <p class="text-gray-600 leading-relaxed whitespace-pre-wrap">{{ developer.bio || '这位开发者很懒，还没有填写简介。' }}</p>
          </div>
          
          <!-- Skills -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">技能栈</h2>
            <div class="flex flex-wrap gap-2">
              <UBadge v-for="skill in developer.skills" :key="skill" color="gray" variant="soft" size="lg">
                {{ skill }}
              </UBadge>
              <span v-if="!developer.skills?.length" class="text-gray-400">暂无标签</span>
            </div>
          </div>
          
          <!-- Social Links -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">社交链接</h2>
             <div class="flex gap-4">
               <template v-if="developer.social_links">
                 <UButton 
                    v-if="developer.social_links.github"
                    :to="developer.social_links.github"
                    target="_blank"
                    icon="i-simple-icons-github"
                    variant="ghost"
                    color="gray"
                  >GitHub</UButton>
                   <UButton 
                    v-if="developer.social_links.website"
                    :to="developer.social_links.website"
                    target="_blank"
                    icon="i-heroicons-globe-alt"
                    variant="ghost"
                    color="gray"
                  >Website</UButton>
               </template>
               <span v-else class="text-gray-400 text-sm">暂无公开链接</span>
             </div>
          </div>
        </div>
      </div>
      
      <!-- Contact Info Card (Unlocked) -->
      <div v-if="contactInfo" class="bg-green-50 rounded-xl p-6 border border-green-100 flex items-center justify-between animate-fade-in">
        <div>
          <h3 class="text-lg font-semibold text-green-900 mb-2">联系方式</h3>
          <div class="space-y-1">
            <p class="text-green-800 flex items-center gap-2">
              <UIcon name="i-simple-icons-wechat" class="w-5 h-5" />
              <span class="font-medium">微信号:</span> {{ contactInfo.wechat_id || '未填写' }}
            </p>
            <p class="text-green-800 flex items-center gap-2">
              <UIcon name="i-heroicons-envelope" class="w-5 h-5" />
              <span class="font-medium">邮箱:</span> {{ contactInfo.email || '未填写' }}
            </p>
          </div>
        </div>
        <UButton color="green" variant="soft" @click="copyContact">复制</UButton>
      </div>

    </div>
    
    <div v-else class="text-center py-20">
       <h2 class="text-xl text-gray-600">用户不存在或已被隐藏</h2>
       <UButton to="/developers" variant="link" class="mt-4">返回列表</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const username = route.params.username as string

const { data: res, pending } = await useFetch<any>(`/api/developers/${username}/public`)
const developer = computed(() => res.value?.data)

const contactInfo = ref<{ wechat_id?: string, email?: string } | null>(null)
const contactPending = ref(false)

// Function to fetch contact info
const fetchContact = async () => {
    try {
        const result = await $fetch<any>(`/api/developers/${username}/contact`)
        contactInfo.value = result.data
    } catch (err: any) {
        // Handle error silently or show toast
    }
}

const copyContact = () => {
  const toast = useToast()
  if (contactInfo.value?.wechat_id) {
    navigator.clipboard.writeText(contactInfo.value.wechat_id)
    toast.add({ title: '已复制微信号' })
  }
}

useSeoMeta({
  title: () => developer.value ? `${developer.value.username} - 独立开发者 | 小概率` : '开发者详情',
  description: () => developer.value?.bio || `${developer.value?.username} 是一位独立开发者，拥有 ${developer.value?.experience_years || '多'}年开发经验`,
  keywords: () => developer.value ? `独立开发者,${developer.value.skills?.join(',')},技术合伙人` : '',
  ogTitle: () => developer.value?.username,
  ogDescription: () => developer.value?.bio,
  ogType: 'profile'
})

// 结构化数据 - Person
const structuredData = computed(() => developer.value ? JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: developer.value.username,
  description: developer.value.bio,
  jobTitle: developer.value.profession || '独立开发者',
  knowsAbout: developer.value.skills || [],
  url: `https://mirauni.com/developers/${developer.value.username}`
}) : '{}')

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: structuredData
    }
  ]
})

// 页面浏览埋点
const { trackDeveloperView } = useTrack()
onMounted(() => {
  if (developer.value?.username) {
    trackDeveloperView(developer.value.username)
  }
})
</script>

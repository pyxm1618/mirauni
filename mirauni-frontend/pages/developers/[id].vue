<template>
  <div class="min-h-screen bg-indie-bg pb-16">
    <div v-if="pending" class="container mx-auto px-4 py-8 animate-pulse">
      <div class="h-64 bg-white border-3 border-black mb-6"></div>
    </div>
    
    <div v-else-if="developer" class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Header / Profile Card -->
      <div class="bg-white border-3 border-black shadow-brutal overflow-hidden mb-8 relative">
        <div class="h-32 bg-indie-primary border-b-3 border-black relative overflow-hidden">
             <!-- Decorative pattern -->
             <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(black 1px, transparent 1px); background-size: 10px 10px;"></div>
        </div>
        <div class="px-8 pb-8 relative">
          <div class="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6 gap-6">
            <div class="relative">
                <div class="absolute inset-0 bg-black translate-x-1 translate-y-1 rounded-full"></div>
                <img 
                :src="developer.avatar_url || 'https://via.placeholder.com/150'" 
                :alt="developer.username || ''"
                width="128"
                height="128"
                decoding="async"
                class="relative w-32 h-32 rounded-full border-3 border-black object-cover bg-white z-10"
                />
            </div>
            
            <div class="flex-grow pt-4 md:pt-0">
              <h1 class="text-4xl font-black text-black mb-1 tracking-tight">{{ developer.username }}</h1>
              <p class="text-xl font-bold text-gray-700 mb-2 border-l-4 border-indie-secondary pl-2">{{ developer.profession || '独立开发者' }} <span v-if="developer.position">| {{ developer.position }}</span></p>
              <div class="flex flex-wrap gap-4 text-sm font-bold text-gray-500">
                <span v-if="developer.location"><UIcon name="i-heroicons-map-pin" /> {{ developer.location }}</span>
                <span v-if="developer.experience_years"><UIcon name="i-heroicons-briefcase" /> {{ developer.experience_years }} 年经验</span>
                <span><UIcon name="i-heroicons-clock" /> 加入时间 {{ new Date(developer.created_at).toLocaleDateString('zh-CN') }}</span>
              </div>
            </div>
            <div class="w-full md:w-auto flex gap-3 mt-4 md:mt-0">
               <!-- Actions -->
               <ClientOnly>
                 <UnlockButton :target-user-id="developer.id" @unlocked="fetchContact">
                     <template #default="{ unlocked, onClick }">
                         <button v-if="!unlocked" @click="onClick" class="px-6 py-3 bg-black text-white border-2 border-black font-brand font-bold shadow-brutal hover:bg-indie-accent hover:text-black hover:shadow-brutal-hover transition-all active:translate-y-1 active:translate-x-1 flex items-center gap-2">
                           <UIcon name="i-heroicons-lock-open" /> 解锁联系方式
                         </button>
                         <button v-else class="px-6 py-3 bg-gray-200 text-gray-500 border-2 border-gray-400 font-bold cursor-default flex items-center gap-2">
                             <UIcon name="i-heroicons-check" /> 已解锁
                         </button>
                     </template>
                 </UnlockButton>
               </ClientOnly>
            </div>
          </div>
          
          <!-- Bio -->
          <div class="mb-8">
            <h2 class="text-2xl font-black mb-4 border-b-4 border-black inline-block">个人介绍</h2>
            <div class="bg-gray-50 border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p class="text-lg font-medium text-gray-800 leading-relaxed whitespace-pre-wrap font-mono">{{ developer.bio || '暂未填写个人介绍。' }}</p>
            </div>
          </div>
          
          <!-- Skills -->
          <div class="mb-8">
            <h2 class="text-2xl font-black mb-4 border-b-4 border-black inline-block">技能标签</h2>
            <div class="flex flex-wrap gap-2">
              <span v-for="skill in developer.skills" :key="skill" class="bg-white border-2 border-black px-3 py-1 text-sm font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {{ skill }}
              </span>
              <span v-if="!developer.skills?.length" class="text-gray-400 font-bold italic">暂未填写技能</span>
            </div>
          </div>
          
          <!-- Social Links -->
          <div>
            <h2 class="text-2xl font-black mb-4 border-b-4 border-black inline-block">社交链接</h2>
             <div class="flex gap-4">
               <template v-if="developer.social_links">
                 <UButton 
                    v-if="developer.social_links.github"
                    :to="developer.social_links.github"
                    target="_blank"
                    icon="i-simple-icons-github"
                    variant="ghost"
                    color="black"
                    class="font-bold uppercase border-2 border-black hover:bg-black hover:text-white transition-all"
                  >GitHub</UButton>
                   <UButton 
                    v-if="developer.social_links.website"
                    :to="developer.social_links.website"
                    target="_blank"
                    icon="i-heroicons-globe-alt"
                    variant="ghost"
                    color="black"
                    class="font-bold uppercase border-2 border-black hover:bg-black hover:text-white transition-all"
                  >Website</UButton>
               </template>
               <span v-else class="text-gray-400 text-sm font-bold">暂无公开链接</span>
             </div>
          </div>
        </div>
      </div>
      
      <!-- Contact Info Card (Unlocked) -->
      <div v-if="contactInfo" class="bg-indie-secondary border-3 border-black p-6 shadow-brutal flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10 text-6xl">联</div>
        <div class="relative z-10">
          <h3 class="text-2xl font-black mb-4">联系方式</h3>
          <div class="space-y-2 font-bold text-lg">
            <p class="flex items-center gap-2">
              <UIcon name="i-simple-icons-wechat" class="w-6 h-6" />
              <span>微信：<span class="bg-black text-white px-2">{{ contactInfo.wechat_id || '暂无' }}</span></span>
            </p>
            <p class="flex items-center gap-2">
              <UIcon name="i-heroicons-envelope" class="w-6 h-6" />
              <span>邮箱：<span class="underline">{{ contactInfo.email || '暂无' }}</span></span>
            </p>
          </div>
        </div>
        <button class="px-6 py-3 bg-white border-3 border-black font-black shadow-brutal hover:bg-gray-100 active:translate-y-1 active:translate-x-1 relative z-10" @click="copyContact">
            复制微信号
        </button>
      </div>

    </div>
    
    <div v-else class="text-center py-20 border-3 border-dashed border-gray-300 m-8">
       <h2 class="text-2xl font-black text-gray-400">未找到该开发者</h2>
       <NuxtLink to="/developers" class="inline-block mt-4 font-bold border-b-2 border-black">返回列表</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const id = route.params.id as string

// UUID Regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// 如果 ID 不是标准 UUID，说明可能是旧版 URL (使用用户名)
if (!uuidRegex.test(id)) {
  // 尝试通过用户名查找 ID
  try {
    const { data: lookup } = await useFetch(`/api/developers/lookup/${id}`)
    if (lookup.value?.id) {
      // 找到 ID，进行 301 永久重定向
      await navigateTo(`/developers/${lookup.value.id}`, { 
        redirectCode: 301,
        external: true // 强制外部跳转以确保 URL 变化被搜索引擎识别
      })
    } else {
      throw createError({ statusCode: 404, message: '用户不存在' })
    }
  } catch (e) {
    throw createError({ statusCode: 404, message: '用户不存在' })
  }
}

const { data: res, pending } = await useFetch<any>(`/api/developers/${id}/public`)
const developer = computed(() => res.value?.data)

const contactInfo = ref<{ wechat_id?: string, email?: string } | null>(null)
const contactPending = ref(false)

// Function to fetch contact info
const fetchContact = async () => {
    try {
        const result = await $fetch<any>(`/api/developers/${id}/contact`)
        contactInfo.value = result.data
    } catch (err: any) {
        // Handle error silently or show toast
    }
}

const copyContact = () => {
  const toast = useToast()
  if (contactInfo.value?.wechat_id) {
    navigator.clipboard.writeText(contactInfo.value.wechat_id)
    toast.add({ title: t('common.copied') })
  }
}

useSeoMeta({
  title: () => developer.value ? `${developer.value.username}｜技术合伙人候选人资料 - ${t('common.appName')}` : t('developer.square.title'),
  description: () => developer.value?.bio || `${developer.value?.username} 的公开资料页，查看技能背景与合作偏好。`,
  keywords: () => developer.value ? `技术合伙人,招募开发者,${developer.value.skills?.join(',') || ''}` : '技术合伙人,招募开发者',
  ogTitle: () => developer.value?.username,
  ogDescription: () => developer.value?.bio,
  ogType: 'profile'
})

useCanonical(`/developers/${id}`)

// 结构化数据 - Person
const structuredData = computed(() => developer.value ? JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: developer.value.username,
  description: developer.value.bio,
  jobTitle: developer.value.profession || t('roles.frontend'),
  knowsAbout: developer.value.skills || [],
  url: `https://mirauni.com/developers/${id}`
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

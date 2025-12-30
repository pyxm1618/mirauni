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
                class="relative w-32 h-32 rounded-full border-3 border-black object-cover bg-white z-10"
                />
            </div>
            
            <div class="flex-grow pt-4 md:pt-0">
              <h1 class="text-4xl font-black text-black mb-1 uppercase tracking-tight">{{ developer.username }}</h1>
              <p class="text-xl font-bold text-gray-700 mb-2 border-l-4 border-indie-secondary pl-2">{{ developer.profession || 'INDEPENDENT_DEV' }} <span v-if="developer.position">| {{ developer.position }}</span></p>
              <div class="flex flex-wrap gap-4 text-sm font-bold text-gray-500 uppercase">
                <span v-if="developer.location"><UIcon name="i-heroicons-map-pin" /> {{ developer.location }}</span>
                <span v-if="developer.experience_years"><UIcon name="i-heroicons-briefcase" /> {{ developer.experience_years }} YRS EXP</span>
                <span><UIcon name="i-heroicons-clock" /> JOINED {{ new Date(developer.created_at).toLocaleDateString() }}</span>
              </div>
            </div>
            <div class="w-full md:w-auto flex gap-3 mt-4 md:mt-0">
               <!-- Actions -->
               <UnlockButton :target-user-id="developer.id" @unlocked="fetchContact">
                   <template #default="{ unlocked, onClick }">
                       <button v-if="!unlocked" @click="onClick" class="px-6 py-3 bg-black text-white border-2 border-black font-brand font-bold shadow-brutal hover:bg-indie-accent hover:text-black hover:shadow-brutal-hover transition-all active:translate-y-1 active:translate-x-1 uppercase flex items-center gap-2">
                         <UIcon name="i-heroicons-lock-open" /> UNLOCK CONTACT
                       </button>
                       <button v-else class="px-6 py-3 bg-gray-200 text-gray-500 border-2 border-gray-400 font-bold cursor-default uppercase flex items-center gap-2">
                           <UIcon name="i-heroicons-check" /> UNLOCKED
                       </button>
                   </template>
               </UnlockButton>
            </div>
          </div>
          
          <!-- Bio -->
          <div class="mb-8">
            <h2 class="text-2xl font-black uppercase mb-4 border-b-4 border-black inline-block">ABOUT_ME</h2>
            <div class="bg-gray-50 border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p class="text-lg font-medium text-gray-800 leading-relaxed whitespace-pre-wrap font-mono">{{ developer.bio || 'NO BIO YET.' }}</p>
            </div>
          </div>
          
          <!-- Skills -->
          <div class="mb-8">
            <h2 class="text-2xl font-black uppercase mb-4 border-b-4 border-black inline-block">SKILLS</h2>
            <div class="flex flex-wrap gap-2">
              <span v-for="skill in developer.skills" :key="skill" class="bg-white border-2 border-black px-3 py-1 text-sm font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {{ skill }}
              </span>
              <span v-if="!developer.skills?.length" class="text-gray-400 font-bold uppercase italic">NO SKILLS LISTED</span>
            </div>
          </div>
          
          <!-- Social Links -->
          <div>
            <h2 class="text-2xl font-black uppercase mb-4 border-b-4 border-black inline-block">SOCIAL_LINKS</h2>
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
               <span v-else class="text-gray-400 text-sm font-bold uppercase">NO LINKS</span>
             </div>
          </div>
        </div>
      </div>
      
      <!-- Contact Info Card (Unlocked) -->
      <div v-if="contactInfo" class="bg-indie-secondary border-3 border-black p-6 shadow-brutal flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10 text-6xl">📞</div>
        <div class="relative z-10">
          <h3 class="text-2xl font-black uppercase mb-4">CONTACT_INFO</h3>
          <div class="space-y-2 font-bold text-lg">
            <p class="flex items-center gap-2">
              <UIcon name="i-simple-icons-wechat" class="w-6 h-6" />
              <span>WECHAT: <span class="bg-black text-white px-2">{{ contactInfo.wechat_id || 'N/A' }}</span></span>
            </p>
            <p class="flex items-center gap-2">
              <UIcon name="i-heroicons-envelope" class="w-6 h-6" />
              <span>EMAIL: <span class="underline">{{ contactInfo.email || 'N/A' }}</span></span>
            </p>
          </div>
        </div>
        <button class="px-6 py-3 bg-white border-3 border-black font-black uppercase shadow-brutal hover:bg-gray-100 active:translate-y-1 active:translate-x-1 relative z-10" @click="copyContact">
            COPY INFO
        </button>
      </div>

    </div>
    
    <div v-else class="text-center py-20 border-3 border-dashed border-gray-300 m-8">
       <h2 class="text-2xl font-black text-gray-400 uppercase">USER NOT FOUND</h2>
       <NuxtLink to="/developers" class="inline-block mt-4 font-bold border-b-2 border-black">BACK TO LIST</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

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

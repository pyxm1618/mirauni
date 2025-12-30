<template>
  <div class="min-h-screen bg-toon-50 py-12 px-4 flex flex-col items-center">
    
    <div v-if="loading" class="text-center space-y-4 pt-20">
        <UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin text-gray-400" />
        <p class="text-gray-500 font-bold">正在提取契约...</p>
    </div>

    <div v-else-if="error" class="text-center pt-20">
        <h1 class="text-2xl font-black mb-2">找不到契约</h1>
        <p class="text-gray-500 mb-6">{{ error }}</p>
        <UButton to="/" color="black">我也要搞钱</UButton>
    </div>

    <div v-else class="w-full max-w-md space-y-8 animate-fade-in-up">
        <!-- Contract -->
        <ContractCard 
            :user-name="planData.nickname"
            :goal="planData.incomeTarget"
            :date="new Date(planData.createdAt).toLocaleDateString()"
            :supervisor-name="signed ? (currentUser?.nickname || '我') : undefined"
            :is-signed="signed"
        />

        <!-- Sign Action -->
        <div class="text-center space-y-6">
            <div v-if="!signed">
                <p class="text-gray-600 font-medium mb-4">
                    {{ planData.nickname }} 邀请你成为监督人<br/>
                    <span class="text-xs text-gray-400">见证 TA 的 2025 搞钱之路</span>
                </p>
                <UButton 
                    size="xl" 
                    color="red" 
                    class="px-16 py-4 text-xl font-black shadow-hard hover:scale-105 transition-transform"
                    :loading="signing"
                    @click="sign"
                >
                    签字画押
                </UButton>
            </div>
            
            <div v-else class="space-y-6">
                <div class="bg-green-100 border-2 border-green-500 text-green-800 p-4 rounded-xl font-bold">
                    签署成功！现在可以互动了：
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <UButton 
                        size="xl" block color="black" variant="solid"
                        class="h-16 text-lg font-bold"
                        @click="sendInteraction('like')"
                    >
                        赞一个
                    </UButton>
                    <UButton 
                        size="xl" block color="white" variant="solid"
                        class="h-16 text-lg font-bold border-2 border-black"
                        @click="sendInteraction('nudge')"
                    >
                        催催 TA
                    </UButton>
                </div>
            </div>

            <div class="pt-8">
                <UButton variant="link" color="gray" to="/">我也要定个小目标</UButton>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContractCard from '~/components/supervision/ContractCard.vue'

definePageMeta({
    layout: 'blank' // Full screen
})

const route = useRoute()
const { user } = useUser()
const loading = ref(true)
const error = ref('')
const planData = ref<any>(null)
const signing = ref(false)
const signed = ref(false)

// Computed helper for current user info
const currentUser = computed(() => {
    if(!user.value) return null
    return {
        nickname: user.value.user_metadata?.nickname || user.value.email?.split('@')[0] || '我'
    }
})

async function fetchPlan() {
    try {
        const userId = route.params.userId
        const data = await $fetch(`/api/public/plan/${userId}`)
        planData.value = data
    } catch (e: any) {
        error.value = "契约不存在或已被删除"
    } finally {
        loading.value = false
    }
}

async function sign() {
    if (!user.value) {
        // Redirect to login if not logged in (Mock alert for now)
        alert('请先登录/注册 Mirauni 账号才能签署')
        // navigateTo('/login?redirect=...')
        return
    }

    signing.value = true
    try {
        await $fetch('/api/supervision/sign', {
            method: 'POST',
            body: { userId: route.params.userId }
        })
        signed.value = true
    } catch (e: any) {
        alert(e.message)
    } finally {
        signing.value = false
    }
}

async function sendInteraction(type: 'like' | 'nudge') {
    try {
        await $fetch('/api/interactions/send', {
            method: 'POST',
            body: { 
                targetUserId: route.params.userId,
                type 
            }
        })
        const msg = type === 'like' ? '鼓励送达！' : '催更成功！'
        alert(msg)
    } catch (e: any) {
        alert(e.message)
    }
}

onMounted(() => {
    fetchPlan()
})
</script>

<style>
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
}
</style>

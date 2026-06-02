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
                    <span class="text-xs text-gray-400">见证 TA 的 2026 搞钱之路</span>
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

const toast = useToast()

async function sign() {
    if (!user.value) {
        // 跳转主站登录，登录后回到当前页
        const currentUrl = encodeURIComponent(window.location.href)
        const isDev = window.location.hostname === 'localhost'
        const mainSiteLogin = isDev 
          ? `http://localhost:3000/login?redirect=${currentUrl}&from=plan`
          : `https://mirauni.com/login?redirect=${currentUrl}&from=plan`
        window.location.href = mainSiteLogin
        return
    }

    signing.value = true
    try {
        await $fetch('/api/supervision/sign', {
            method: 'POST',
            body: { userId: route.params.userId }
        })
        signed.value = true
        toast.add({
            title: '🎉 签署成功',
            description: '你已成为监督人！',
            color: 'green'
        })
    } catch (e: any) {
        // Friendly error message for "Self Supervision"
        const msg = e.data?.message || e.message
        if (msg && msg.includes('不能做自己的监督人')) {
             toast.add({
                title: '无法签署',
                description: '不能做自己的监督人哦，快去邀请好友来签吧！',
                icon: 'i-lucide-alert-circle',
                color: 'orange'
            })
        } else {
             toast.add({
                title: '签署失败', // Generic error
                description: msg || '请重试',
                color: 'red'
            })
        }
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
        toast.add({
            title: msg,
            color: 'green'
        })
    } catch (e: any) {
         toast.add({
            title: '发送失败',
            description: e.message,
            color: 'red'
        })
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

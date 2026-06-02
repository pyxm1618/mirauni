<template>
  <div class="max-w-xl mx-auto space-y-8">
    <div class="text-center">
        <h1 class="text-3xl font-black mb-2">寻找监督人</h1>
        <p class="text-gray-500">
            一个人坚持太难？找个朋友来当你的“搞钱监督员”。<br/>
            签署契约后，他可以查看你的进度并提醒你。
        </p>
    </div>

    <!-- Preview -->
    <div class="transform scale-90 md:scale-100 origin-top">
        <ContractCard 
            :user-name="user?.user_metadata?.nickname || user?.email?.split('@')[0] || '我'"
            :goal="store.generatedPlan?.incomeGoal || store.incomeGoal || '100'"
            :date="new Date().toLocaleDateString()"
        />
    </div>

    <!-- Actions -->
    <div class="bg-white border-2 border-black rounded-xl p-6 shadow-hard-sm space-y-4">
        <div class="flex gap-2">
            <input 
                readonly 
                :value="inviteLink" 
                class="flex-1 bg-gray-100 border-2 border-gray-200 rounded-lg px-3 text-sm text-gray-600 outline-none"
            />
            <UButton 
                color="black" 
                icon="i-lucide-copy"
                @click="copyLink"
            >
                {{ copied ? '已复制' : '复制链接' }}
            </UButton>
        </div>
        <p class="text-xs text-gray-400 text-center">
            把链接发给微信好友，让他确认即可生效。
        </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContractCard from '~/components/supervision/ContractCard.vue'
import { useWizardStore } from '~/stores/wizard'

definePageMeta({
    // Auth is handled globally by auth.global.ts
})

const store = useWizardStore()
const { user } = useUser()
const copied = ref(false)

const inviteLink = computed(() => {
    if (!user.value) return ''
    // In dev: localhost:3000/p/userId
    // In prod: plan.mirauni.com/p/userId
    const origin = process.client ? window.location.origin : ''
    return `${origin}/p/${user.value.id}`
})

function copyLink() {
    navigator.clipboard.writeText(inviteLink.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
}
</script>

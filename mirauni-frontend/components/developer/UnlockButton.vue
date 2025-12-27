<script setup lang="ts">
import PaymentModal from '~/components/payment/PaymentModal.vue'

const props = defineProps<{
  targetUserId: string
  modelValue?: boolean // v-model for unlocked status
}>()

const emit = defineEmits(['update:modelValue', 'unlocked'])

const unlocked = ref(props.modelValue || false)
const showPayment = ref(false)
const showConfirm = ref(false)
const user = useSupabaseUser()
const toast = useToast()

// Watch external prop change
watch(() => props.modelValue, (val) => {
    if (val !== undefined) unlocked.value = val
})

// Check status on mount
onMounted(async () => {
    if (!unlocked.value && user.value) {
        checkStatus()
    }
})

async function checkStatus() {
    try {
        const result = await $fetch<{unlocked: boolean}>('/api/unlock/check', {
            params: { targetUserId: props.targetUserId }
        })
        unlocked.value = result.unlocked
        emit('update:modelValue', result.unlocked)
        if (result.unlocked) emit('unlocked')
    } catch (e) {}
}

async function handleClick() {
    if (!user.value) {
        navigateTo('/login')
        return
    }
    
    if (unlocked.value) return
    
    showConfirm.value = true
}

async function confirmUnlock() {
    showConfirm.value = false
    try {
        const data = await $fetch<{success: boolean}>('/api/unlock/purchase', {
            method: 'POST',
            body: { targetUserId: props.targetUserId }
        })
        if (data.success) {
            unlocked.value = true
            emit('update:modelValue', true)
            emit('unlocked')
            toast.add({ title: '解锁成功', color: 'green' })
        }
    } catch (e: any) {
        if (e.response?.status === 402) {
            showPayment.value = true
        } else {
            toast.add({ title: e.message || '解锁失败', color: 'red' })
        }
    }
}
</script>

<template>
  <div>
    <slot :unlocked="unlocked" :onClick="handleClick">
        <UButton :color="unlocked ? 'gray' : 'primary'" @click="handleClick">
            {{ unlocked ? '已解锁' : '解锁联系方式' }}
        </UButton>
    </slot>

    <!-- Confirm Modal -->
    <UModal v-model="showConfirm">
        <UCard>
            <template #header>
                <div class="font-bold">确认解锁</div>
            </template>
            <p>解锁将消耗 1 次机会，确定继续吗？</p>
            <template #footer>
                <div class="flex justify-end space-x-2">
                    <UButton color="gray" variant="ghost" @click="showConfirm = false">取消</UButton>
                    <UButton color="primary" @click="confirmUnlock">确定</UButton>
                </div>
            </template>
        </UCard>
    </UModal>
    
    <!-- Payment Modal -->
    <PaymentModal 
        v-model="showPayment" 
        @success="confirmUnlock" 
    />
  </div>
</template>

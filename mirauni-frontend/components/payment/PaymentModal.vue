<script setup lang="ts">
import QRCode from 'qrcode'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'success'])

const packages = [
  { id: 'basic', amount: 30, credits: 10, label: '体验包' },
  { id: 'standard', amount: 50, credits: 30, label: '推荐包', tag: '热销' },
  { id: 'premium', amount: 100, credits: 100, label: '豪华包' }
]

const selectedPackage = ref('standard')
const loading = ref(false)
const orderNo = ref('')
const qrCodeUrl = ref('')
const isWeChat = ref(false) // Check if in WeChat browser

onMounted(() => {
  if (process.client) {
      const ua = navigator.userAgent.toLowerCase()
      isWeChat.value = ua.indexOf('micromessenger') !== -1
  }
})

async function handlePay() {
  loading.value = true
  try {
      const { data } = await $fetch<any>('/api/payment/create-order', {
          method: 'POST',
          body: {
              packageId: selectedPackage.value,
              payType: isWeChat.value ? 'jsapi' : 'native'
          }
      })
      
      if (data.mock) {
          // Mock Success
          setTimeout(() => {
              emit('success')
              emit('update:modelValue', false)
          }, 1000)
          return
      }
      
      if (data.codeUrl) {
          // Native Pay
          orderNo.value = data.orderNo
          qrCodeUrl.value = await QRCode.toDataURL(data.codeUrl)
          startPolling()
      } else if (data.paySign) {
          // JSAPI Pay
          onBridgeReady(data)
      }
  } catch (e) {
      alert('支付发起失败')
  } finally {
      loading.value = false
  }
}

function onBridgeReady(params: any) {
    if (typeof window === 'undefined') return
    // @ts-ignore
    const WeixinJSBridge = (window as any).WeixinJSBridge
    if (!WeixinJSBridge) {
        alert('请在微信内打开')
        return
    }
    
    WeixinJSBridge.invoke('getBrandWCPayRequest', {
        "appId": params.appId,
        "timeStamp": params.timeStamp,
        "nonceStr": params.nonceStr,
        "package": params.package,
        "signType": params.signType,
        "paySign": params.paySign
    },
    function(res: any) {
        if(res.err_msg == "get_brand_wcpay_request:ok" ) {
             emit('success')
             emit('update:modelValue', false)
        }
    })
}

let pollTimer: any
function startPolling() {
    pollTimer = setInterval(async () => {
        try {
            const { data } = await $fetch<any>('/api/payment/status', {
                params: { orderNo: orderNo.value }
            })
            if (data.status === 'paid') {
                clearInterval(pollTimer)
                emit('success')
                emit('update:modelValue', false)
            }
        } catch (e) {}
    }, 2000)
}

onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer)
})

// Reset state when modal closes
watch(() => props.modelValue, (val) => {
    if (!val) {
        // Delay reset to avoid UI flicker
        setTimeout(() => {
            qrCodeUrl.value = ''
            orderNo.value = ''
            loading.value = false
            if (pollTimer) clearInterval(pollTimer)
        }, 300)
    }
})
</script>

<template>
  <UModal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <UCard>
      <template #header>
        <div class="text-xl font-bold">充值解锁次数</div>
      </template>
      
      <div v-if="!qrCodeUrl" class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
              <div 
                v-for="pkg in packages" 
                :key="pkg.id"
                class="border rounded-lg p-4 cursor-pointer flex justify-between items-center transition-all"
                :class="selectedPackage === pkg.id ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500' : 'border-gray-200 hover:border-primary-300'"
                @click="selectedPackage = pkg.id"
              >
                  <div>
                      <div class="flex items-center space-x-2">
                        <div class="font-bold text-lg">{{ pkg.label }}</div>
                        <UBadge v-if="pkg.tag" color="red" variant="subtle" size="xs">{{ pkg.tag }}</UBadge>
                      </div>
                      <div class="text-gray-500 text-sm">{{ pkg.credits }}次解锁机会</div>
                  </div>
                  <div class="text-primary-600 font-bold text-xl">¥{{ pkg.amount }}</div>
              </div>
          </div>
          
          <UButton block :loading="loading" @click="handlePay">
              立即支付
          </UButton>
      </div>
      
      <div v-else class="flex flex-col items-center space-y-4 py-4">
          <img :src="qrCodeUrl" class="w-48 h-48" />
          <div class="text-gray-500 text-sm">请使用微信扫码支付</div>
          <div class="text-xs text-gray-400">支付完成后自动关闭</div>
      </div>
    </UCard>
  </UModal>
</template>

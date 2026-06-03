<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-5xl font-black font-display mb-12 uppercase">{{ $t('me.recharge.title') }}</h1>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- 侧边栏 -->
      <aside class="lg:col-span-1">
        <nav class="bg-white border-3 border-black shadow-brutal sticky top-8">
          <NuxtLink to="/me" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
            {{ $t('me.nav.profile') }}
          </NuxtLink>
          <NuxtLink to="/me/projects" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
             {{ $t('me.nav.projects') }}
          </NuxtLink>
           <NuxtLink to="/me/messages" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
            {{ $t('me.nav.messages') }}
          </NuxtLink>
          <NuxtLink to="/me/recharge" class="block px-6 py-4 font-black uppercase bg-indie-primary border-black hover:bg-indie-accent transition-colors">
            {{ $t('me.nav.recharge') }}
          </NuxtLink>
          <button @click="handleLogout" class="w-full text-left px-6 py-4 bg-red-100 font-black uppercase hover:bg-red-600 hover:text-white transition-colors">
            {{ $t('me.nav.logout') }}
          </button>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="lg:col-span-3">
        <!-- 当前余额 -->
        <div class="bg-white border-3 border-black shadow-brutal p-8 mb-12 relative overflow-hidden">
          <div class="relative z-10 flex items-center justify-between">
            <div>
              <p class="text-gray-500 font-bold uppercase mb-2">{{ $t('me.recharge.balance') }}</p>
              <p class="text-6xl font-black">
                {{ unlockCredits }} 
                <span class="text-2xl font-bold text-gray-400">{{ $t('me.recharge.credits') }}</span>
              </p>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold uppercase bg-black text-white px-3 py-1 inline-block mb-1 transform rotate-2">
                {{ $t('me.recharge.lifetime') }}
              </div>
              <p class="text-4xl font-black">{{ lifetimeUnlocks }}</p>
            </div>
          </div>
          <div class="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
             <UIcon name="i-heroicons-currency-yen" class="w-64 h-64" />
          </div>
        </div>

        <!-- 套餐选择 -->
        <h2 class="text-3xl font-black mb-8 uppercase border-l-8 border-indie-secondary pl-4">{{ $t('me.recharge.package') }}</h2>
        <div class="grid md:grid-cols-3 gap-6 mb-12">
          <div 
            v-for="pkg in packages" 
            :key="pkg.id"
            class="border-3 border-black shadow-brutal p-6 cursor-pointer transition-all relative group"
            :class="selectedPackage === pkg.id ? 'bg-indie-primary text-black translate-x-[2px] translate-y-[2px] shadow-none' : 'bg-white hover:shadow-brutal-hover hover:-translate-y-1'"
            @click="selectedPackage = pkg.id"
          >
            <div v-if="selectedPackage === pkg.id" class="absolute top-2 right-2 text-black">
                <UIcon name="i-heroicons-check-circle-solid" class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-black mb-4 uppercase tracking-wide">{{ pkg.name }}</h3>
            <div class="text-4xl font-black mb-4 font-display">
              ¥{{ pkg.price }}
            </div>
            <div class="border-t-2 border-dashed mb-4" :class="selectedPackage === pkg.id ? 'border-black' : 'border-gray-300'"></div>
            <p class="font-bold mb-2 uppercase">{{ pkg.credits }} {{ $t('me.recharge.unlocks') }}</p>
            <p class="text-sm font-mono opacity-70">{{ pkg.perCredit }} {{ $t('me.recharge.perUnlock') }}</p>
          </div>
        </div>

        <!-- 首充优惠提示 (仅当用户具有 is_first_charge 属性时) -->
        <div v-if="user?.is_first_charge" class="bg-indie-accent border-3 border-black p-6 mb-12 shadow-brutal flex items-center gap-6">
            <div class="text-5xl bg-white border-3 border-black w-20 h-20 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <UIcon name="i-heroicons-gift-solid" class="w-10 h-10" />
            </div>
            <div>
              <p class="font-black text-xl uppercase mb-1">{{ $t('me.recharge.bonus.title') }}</p>
              <p class="font-bold">{{ $t('me.recharge.bonus.desc') }}</p>
            </div>
        </div>

        <!-- 支付按钮 -->
        <button 
          @click="showPaymentModal = true"
          class="w-full md:w-auto px-12 py-5 bg-[#07C160] text-white border-3 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-black text-2xl uppercase flex items-center justify-center gap-3"
        >
          <UIcon name="i-ri-wechat-pay-fill" class="w-8 h-8" />
          {{ $t('me.recharge.pay') }} ¥{{ selectedPackageInfo?.price || 0 }}
        </button>

        <!-- 解锁记录 -->
        <div class="mt-20">
          <h2 class="text-3xl font-black mb-8 uppercase border-l-8 border-black pl-4">{{ $t('me.recharge.history') }}</h2>
          <div class="bg-white border-3 border-black shadow-brutal">
            <div v-if="historyList.length === 0" class="p-8 text-center text-gray-500 font-bold uppercase font-mono">
              {{ $t('common.empty') || '暂无解锁记录' }}
            </div>
            <div v-else v-for="record in historyList" :key="record.id" class="p-6 border-b-3 border-black last:border-b-0 flex items-center justify-between group hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-indie-secondary border-3 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <img v-if="record.target_user?.avatar_url" :src="record.target_user.avatar_url" class="w-full h-full object-cover" />
                    <span v-else>👤</span>
                </div>
                <div>
                  <p class="font-black uppercase text-lg">{{ record.target_user?.username || '未知用户' }}</p>
                  <p class="text-sm font-bold text-gray-500 uppercase">
                    {{ $t('me.recharge.unlockedVia') }} "{{ record.target_project?.title || '主页公开联系方式' }}"
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-gray-400 mb-1 font-mono">
                  {{ formatDate(record.created_at) }}
                </p>
                <NuxtLink :to="`/me/messages?chat=${record.target_user?.id}`" class="text-sm font-black uppercase text-black border-b-2 border-black hover:bg-black hover:text-white transition-colors">
                  {{ $t('me.recharge.sendMessage') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 支付弹窗组件 -->
    <ClientOnly>
      <PaymentModal 
        v-model="showPaymentModal" 
        :package-id="selectedPackage"
        @success="handlePaymentSuccess" 
      />
    </ClientOnly>

    <!-- 退出登录确认模态弹窗 -->
    <UModal v-model="showLogoutModal">
      <div class="p-8 bg-white border-3 border-black shadow-brutal text-center">
        <h3 class="text-2xl font-black mb-6 uppercase">{{ $t('me.profile.logoutConfirm') || '确定要退出登录吗？' }}</h3>
        <div class="flex gap-4 justify-center">
          <button 
            type="button"
            @click="showLogoutModal = false" 
            class="px-6 py-3 border-3 border-black font-bold uppercase hover:bg-gray-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none"
          >
            {{ $t('common.cancel') || '取消' }}
          </button>
          <button 
            type="button"
            @click="confirmLogout" 
            class="px-6 py-3 bg-red-500 text-white border-3 border-black font-black uppercase hover:bg-red-600 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none"
          >
            {{ $t('common.confirm') || '确定' }}
          </button>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PaymentModal from '~/components/payment/PaymentModal.vue'

const { t } = useI18n()
const { logout, user, refreshUser } = useAuth()

definePageMeta({
  middleware: 'auth'
})

// 加载真实的充值及解锁统计接口数据
const { data: rechargeRes, refresh: refreshRecharge } = await useFetch<any>('/api/me/recharge-info')

const info = computed(() => rechargeRes.value?.data)
const unlockCredits = computed(() => info.value?.unlock_credits ?? 0)
const lifetimeUnlocks = computed(() => info.value?.lifetime_unlocks ?? 0)
const historyList = computed(() => info.value?.history ?? [])

const showLogoutModal = ref(false)
const showPaymentModal = ref(false)

function handleLogout() {
  showLogoutModal.value = true
}

async function confirmLogout() {
  showLogoutModal.value = false
  await logout()
}

async function handlePaymentSuccess() {
  // 支付成功后，刷新余额数据和 Auth Store 的用户状态
  await refreshRecharge()
  await refreshUser()
}

const packages = computed(() => [
  { id: 'basic', name: t('me.recharge.packages.basic'), price: 30, credits: 10, perCredit: '3.0' },
  { id: 'standard', name: t('me.recharge.packages.standard'), price: 50, credits: 30, perCredit: '1.7' },
  { id: 'premium', name: t('me.recharge.packages.premium'), price: 100, credits: 100, perCredit: '1.0' }
])

const selectedPackage = ref('standard')

const selectedPackageInfo = computed(() => 
  packages.value.find((p: any) => p.id === selectedPackage.value)
)

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

useSeoMeta({
  title: () => `${t('me.recharge.title')} - ${t('common.appName')}`,
  robots: 'noindex'
})
</script>

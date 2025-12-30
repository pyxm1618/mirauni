<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-5xl font-black font-display mb-12 uppercase">{{ $t('me.title') }}</h1>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- 侧边栏 -->
      <aside class="lg:col-span-1">
        <nav class="bg-white border-3 border-black shadow-brutal sticky top-8">
          <NuxtLink to="/me" class="block px-6 py-4 border-b-3 border-black font-black uppercase bg-indie-primary hover:bg-indie-accent transition-colors">
            {{ $t('me.nav.profile') }}
          </NuxtLink>
          <NuxtLink to="/me/projects" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
            {{ $t('me.nav.projects') }}
          </NuxtLink>
          <NuxtLink to="/me/messages" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors relative">
            {{ $t('me.nav.messages') }}
            <span v-if="unreadCount > 0" class="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-red-600 text-white text-xs font-black border-2 border-black">{{ unreadCount }}</span>
          </NuxtLink>
          <NuxtLink to="/me/recharge" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
            {{ $t('me.nav.recharge') }}
          </NuxtLink>
          <button @click="handleLogout" class="w-full text-left px-6 py-4 bg-red-100 font-black uppercase hover:bg-red-600 hover:text-white transition-colors">
            {{ $t('me.nav.logout') }}
          </button>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="lg:col-span-3">
        <div class="bg-white border-3 border-black shadow-brutal p-8">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 border-b-4 border-black pb-6">
            <h2 class="text-3xl font-black uppercase">{{ $t('me.profile.title') }}</h2>
            <div class="flex items-center gap-4 bg-yellow-50 px-6 py-3 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               <span class="font-black uppercase">{{ $t('me.profile.credits') }}:</span>
               <span class="text-2xl font-black">{{ authStore.userCredits }}</span>
               <UButton to="/me/recharge" size="sm" color="black" variant="solid" class="uppercase font-bold border-2 border-black bg-black text-white hover:bg-gray-800">{{ $t('me.profile.addFunds') }}</UButton>
            </div>
          </div>
          
          <!-- 消息提示 -->
          <div v-if="message" :class="`mb-8 p-4 border-3 border-black font-bold uppercase shadow-brutal-sm ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`">
            {{ message }}
          </div>

          <form @submit.prevent="saveProfile" class="space-y-8">
             <!-- 头像 -->
             <div>
               <label class="block font-black mb-4 uppercase">{{ $t('me.profile.avatar') }}</label>
               <div class="flex items-center gap-6">
                 <div class="relative group cursor-pointer w-24 h-24" @click="triggerFileInput">
                   <img 
                     v-if="form.avatar_url" 
                     :src="form.avatar_url" 
                     class="w-full h-full rounded-full border-3 border-black object-cover"
                   />
                   <div v-else class="w-20 h-20 rounded-full border-3 border-black bg-indie-secondary flex items-center justify-center text-4xl shadow-brutal mb-4 group-hover:scale-105 transition-transform">
                    <UIcon name="i-heroicons-user-solid" class="w-10 h-10" />
                  </div>
                   
                   <!--上传遮罩-->
                   <div class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span class="text-white text-sm font-black uppercase">{{ $t('me.profile.change') }}</span>
                   </div>
                 </div>
                 
                 <div class="flex flex-col gap-2">
                   <button 
                     type="button" 
                     @click="triggerFileInput"
                     :disabled="isUploading"
                     class="px-6 py-2 border-3 border-black font-black text-sm bg-white hover:bg-black hover:text-white uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
                   >
                     {{ isUploading ? $t('me.profile.uploading') : $t('me.profile.upload') }}
                   </button>
                   <p class="text-xs font-bold text-gray-400 uppercase">{{ $t('me.profile.avatarHint') }}</p>
                 </div>
                 
                 <input 
                   type="file" 
                   ref="fileInput" 
                   class="hidden" 
                   accept="image/jpeg,image/png,image/webp"
                   @change="handleFileChange"
                 />
               </div>
             </div>

            <!-- 用户名 -->
            <div>
              <label class="block font-black mb-2 uppercase">{{ $t('me.profile.username') }} <span class="text-red-600">*</span></label>
              <input 
                v-model="form.username" 
                type="text" 
                required
                class="w-full px-4 py-3 bg-gray-50 border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all" 
                :placeholder="$t('me.profile.usernamePlaceholder')" 
              />
              <p class="text-sm font-bold text-gray-500 mt-2 uppercase">URL: mirauni.com/developer/{{ form.username || 'username' }}</p>
            </div>

            <!-- 职位/职业 -->
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block font-black mb-2 uppercase">{{ $t('me.profile.profession') }}</label>
                <input 
                  v-model="form.profession" 
                  type="text" 
                  class="w-full px-4 py-3 bg-gray-50 border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all" 
                  :placeholder="$t('me.profile.professionPlaceholder')" 
                />
              </div>
              <div>
                <label class="block font-black mb-2 uppercase">{{ $t('me.profile.titleLabel') }}</label>
                <input 
                  v-model="form.position" 
                  type="text" 
                  class="w-full px-4 py-3 bg-gray-50 border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all" 
                  :placeholder="$t('me.profile.titlePlaceholder')" 
                />
              </div>
            </div>

            <!-- 简介 -->
            <div>
              <label class="block font-black mb-2 uppercase">{{ $t('me.profile.bio') }}</label>
              <textarea 
                v-model="form.bio" 
                rows="4" 
                class="w-full p-4 bg-gray-50 border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all font-mono" 
                :placeholder="$t('me.profile.bioPlaceholder')"
                maxlength="200"
              ></textarea>
              <p class="text-right text-xs font-bold text-gray-400 mt-1">{{ form.bio?.length || 0 }}/200</p>
            </div>

            <!-- 技能 -->
            <div>
              <label class="block font-black mb-2 uppercase">{{ $t('me.profile.skills') }}</label>
              <div class="flex flex-wrap gap-2 mb-4">
                <span 
                  v-for="skill in form.skills" 
                  :key="skill"
                  class="px-3 py-1 bg-indie-primary border-2 border-black flex items-center gap-2 text-sm font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {{ getSkillLabel(skill) }}
                  <button type="button" @click="removeSkill(skill)" class="hover:text-white transition-colors ml-1">×</button>
                </span>
              </div>
              
              <div class="relative">
                <select 
                  @change="addSkill($event)" 
                  class="w-full px-4 py-3 border-3 border-black bg-white appearance-none cursor-pointer hover:bg-gray-50 font-bold uppercase"
                  :disabled="form.skills?.length >= 10"
                >
                  <option value="">+ {{ $t('me.profile.addSkill') }}</option>
                  <optgroup v-for="group in skillGroups" :key="group.label" :label="group.label">
                    <option 
                      v-for="skill in group.options" 
                      :key="skill.value" 
                      :value="skill.value"
                      :disabled="form.skills?.includes(skill.value)"
                    >
                      {{ skill.label }}
                    </option>
                  </optgroup>
                </select>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-black">▼</div>
              </div>
            </div>

            <!-- 经验与偏好 -->
            <div class="grid md:grid-cols-3 gap-6">
              <div>
                <label class="block font-black mb-2 uppercase">{{ $t('me.profile.exp') }}</label>
                <input 
                  v-model.number="form.experience_years" 
                  type="number" 
                  min="0"
                  max="50"
                  class="w-full px-4 py-3 bg-gray-50 border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all" 
                />
              </div>
              <div>
                <label class="block font-black mb-2 uppercase">{{ $t('me.profile.preference') }}</label>
                <select 
                  v-model="form.work_preference" 
                  class="w-full px-4 py-3 border-3 border-black bg-white font-bold uppercase appearance-none"
                >
                  <option value="fulltime">{{ $t('me.profile.fulltime') }}</option>
                  <option value="parttime">{{ $t('me.profile.parttime') }}</option>
                </select>
              </div>
              <div>
                <label class="block font-black mb-2 uppercase">{{ $t('me.profile.location') }}</label>
                <input 
                  v-model="form.location" 
                  type="text" 
                  class="w-full px-4 py-3 bg-gray-50 border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all" 
                  :placeholder="$t('me.profile.locationPlaceholder')" 
                />
              </div>
            </div>

            <!-- 联系方式（付费可见） -->
            <div class="pt-8 border-t-4 border-black bg-indie-bg p-6 -mx-8 md:mx-0 md:border-3 md:bg-gray-50 md:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
              <h3 class="text-xl font-black mb-6 flex items-center gap-4 uppercase">
                 {{ $t('me.profile.contactInfo') }}
                <span class="text-xs font-black bg-yellow-300 text-black border-2 border-black px-2 py-0.5 uppercase shadow-sm">{{ $t('me.profile.visibleAfterUnlock') }}</span>
              </h3>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block font-black mb-2 uppercase">{{ $t('me.profile.wechat') }}</label>
                  <input 
                    v-model="form.wechat_id" 
                    type="text" 
                    class="w-full px-4 py-3 bg-white border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all" 
                    :placeholder="$t('me.profile.wechatPlaceholder')" 
                  />
                </div>
                <div>
                  <label class="block font-black mb-2 uppercase">{{ $t('me.profile.email') }}</label>
                  <input 
                    v-model="form.email" 
                    type="email" 
                    class="w-full px-4 py-3 bg-white border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all" 
                    :placeholder="$t('me.profile.emailPlaceholder')" 
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-8">
              <button 
                type="submit" 
                :disabled="isSaving"
                class="px-12 py-4 bg-indie-primary border-3 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-black uppercase text-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSaving ? $t('me.profile.saving') : $t('me.profile.save') }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { SKILLS, ROLES } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { uploadAvatar } = useUpload()
const { logout } = useAuth()
const { t } = useI18n()

// 状态
const form = ref({
  username: '',
  avatar_url: '',
  bio: '',
  profession: '',
  position: '',
  location: '',
  skills: [] as string[],
  experience_years: 0,
  work_preference: 'fulltime',
  wechat_id: '',
  email: ''
})

const isUploading = ref(false)
const isSaving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const fileInput = ref<HTMLInputElement | null>(null)
const unreadCount = ref(0) // TODO: 从 API 获取

// 初始化数据
onMounted(() => {
  if (authStore.user) {
    const u = authStore.user
    form.value = {
      username: u.username || '',
      avatar_url: u.avatar_url || '',
      bio: u.bio || '',
      profession: u.profession || '',
      position: u.position || '',
      location: u.location || '',
      skills: u.skills || [],
      experience_years: u.experience_years || 0,
      work_preference: u.work_preference || 'fulltime',
      wechat_id: u.wechat_id || '',
      email: u.email || ''
    }
  }
})

// 技能相关
const skillGroups = computed(() => {
  const groups: Record<string, { label: string, options: any[] }> = {}
  SKILLS.forEach(skill => {
    if (!groups[skill.category]) {
      groups[skill.category] = { label: t('roles.' + skill.category), options: [] }
    }
    groups[skill.category].options.push(skill)
  })
  return Object.values(groups)
})

function getSkillLabel(value: string) {
  return t('skills.' + value)
}

function addSkill(event: Event) {
  const select = event.target as HTMLSelectElement
  const value = select.value
  if (value && !form.value.skills.includes(value)) {
    if (form.value.skills.length < 10) {
      form.value.skills.push(value)
    }
  }
  select.value = '' // 重置选择
}

function removeSkill(skill: string) {
  form.value.skills = form.value.skills.filter(s => s !== skill)
}

// 头像上传
function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  isUploading.value = true
  message.value = ''

  try {
    const url = await uploadAvatar(file)
    form.value.avatar_url = url
    // 同步更新 store 中的用户头像
    authStore.updateUser({ avatar_url: url })
    showMessage(t('me.profile.uploadSuccess'))
  } catch (e: any) {
    showMessage(e.message || t('common.loading'), 'error')
  } finally {
    isUploading.value = false
    input.value = '' // 清空 input
  }
}

// 保存资料
async function saveProfile() {
  isSaving.value = true
  message.value = ''

  try {
    const res = await $fetch<{ success: boolean; user: any; message: string }>('/api/users/profile', {
      method: 'PUT',
      body: form.value
    })
    
    authStore.setUser(res.user)
    showMessage(t('me.profile.saveSuccess'))
  } catch (e: any) {
    const errorMsg = e.data?.data?.errors 
      ? Object.values(e.data.data.errors).flat().join(', ')
      : (e.data?.message || t('me.profile.saving') + ' ' + t('messages.error'))
    showMessage(errorMsg, 'error')
  } finally {
    isSaving.value = false
  }
}

// 退出登录
async function handleLogout() {
  if (confirm(t('me.profile.logoutConfirm'))) {
    await logout()
  }
}

function showMessage(msg: string, type: 'success' | 'error' = 'success') {
  message.value = msg
  messageType.value = type
  if (type === 'success') {
    setTimeout(() => {
      message.value = ''
    }, 3000)
  }
}

useSeoMeta({
  title: t('me.title') + ' - ' + t('home.title'),
  robots: 'noindex'
})
</script>

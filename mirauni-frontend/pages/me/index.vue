<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-display font-bold mb-8">个人中心</h1>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- 侧边栏 -->
      <aside class="lg:col-span-1">
        <nav class="bg-white border-2 border-indie-border shadow-brutal sticky top-8">
          <NuxtLink to="/me" class="block px-6 py-4 border-b border-gray-200 font-bold bg-indie-primary">
            个人资料
          </NuxtLink>
          <NuxtLink to="/me/projects" class="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
            我的项目
          </NuxtLink>
          <NuxtLink to="/me/messages" class="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50">
            站内信
            <span v-if="unreadCount > 0" class="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{{ unreadCount }}</span>
          </NuxtLink>
          <NuxtLink to="/me/recharge" class="block px-6 py-4 hover:bg-gray-50">
            充值
          </NuxtLink>
          <button @click="handleLogout" class="w-full text-left px-6 py-4 border-t border-gray-200 hover:bg-red-50 text-red-600 font-bold">
            退出登录
          </button>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="lg:col-span-3">
        <div class="bg-white border-2 border-indie-border shadow-brutal p-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">个人资料</h2>
            <div class="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
               <span class="text-yellow-700 font-medium">解锁次数:</span>
               <span class="text-xl font-bold text-yellow-600">{{ authStore.userCredits }}</span>
               <UButton to="/me/recharge" size="xs" color="yellow" variant="soft">充值</UButton>
            </div>
          </div>
          
          <!-- 消息提示 -->
          <div v-if="message" :class="`mb-6 p-4 border-2 border-indie-border ${messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`">
            {{ message }}
          </div>

          <form @submit.prevent="saveProfile" class="space-y-6">
            <!-- 头像 -->
            <div>
              <label class="block text-sm font-bold mb-2">头像</label>
              <div class="flex items-center gap-6">
                <div class="relative group cursor-pointer" @click="triggerFileInput">
                  <img 
                    v-if="form.avatar_url" 
                    :src="form.avatar_url" 
                    class="w-24 h-24 rounded-full border-2 border-indie-border object-cover"
                  />
                  <div v-else class="w-24 h-24 bg-indie-secondary border-2 border-indie-border rounded-full flex items-center justify-center text-4xl">
                    👤
                  </div>
                  
                  <!--上传遮罩-->
                  <div class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-white text-sm font-bold">更换</span>
                  </div>
                </div>
                
                <div class="flex flex-col gap-2">
                  <button 
                    type="button" 
                    @click="triggerFileInput"
                    :disabled="isUploading"
                    class="px-4 py-2 border-2 border-indie-border hover:bg-gray-50 font-bold text-sm bg-white"
                  >
                    {{ isUploading ? '上传中...' : '上传头像' }}
                  </button>
                  <p class="text-xs text-gray-400">支持 JPG, PNG, WebP (最大 500KB)</p>
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
              <label class="block text-sm font-bold mb-2">用户名 <span class="text-red-500">*</span></label>
              <input 
                v-model="form.username" 
                type="text" 
                required
                class="w-full px-4 py-3 border-2 border-indie-border focus:outline-none focus:border-indie-text" 
                placeholder="设置唯一用户名（2-20位字母数字）" 
              />
              <p class="text-sm text-gray-500 mt-1">用于个人主页 URL：mirauni.com/developer/{{ form.username || 'username' }}</p>
            </div>

            <!-- 职位/职业 -->
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold mb-2">职业</label>
                <input 
                  v-model="form.profession" 
                  type="text" 
                  class="w-full px-4 py-3 border-2 border-indie-border focus:outline-none focus:border-indie-text" 
                  placeholder="例如：前端工程师" 
                />
              </div>
              <div>
                <label class="block text-sm font-bold mb-2">当前职位</label>
                <input 
                  v-model="form.position" 
                  type="text" 
                  class="w-full px-4 py-3 border-2 border-indie-border focus:outline-none focus:border-indie-text" 
                  placeholder="例如：高级开发专家" 
                />
              </div>
            </div>

            <!-- 简介 -->
            <div>
              <label class="block text-sm font-bold mb-2">个人简介</label>
              <textarea 
                v-model="form.bio" 
                rows="3" 
                class="w-full px-4 py-3 border-2 border-indie-border focus:outline-none focus:border-indie-text" 
                placeholder="介绍一下你的经历、专长和兴趣..."
                maxlength="200"
              ></textarea>
              <p class="text-right text-xs text-gray-400">{{ form.bio?.length || 0 }}/200</p>
            </div>

            <!-- 技能 -->
            <div>
              <label class="block text-sm font-bold mb-2">技能标签 (最多10个)</label>
              <div class="flex flex-wrap gap-2 mb-3">
                <span 
                  v-for="skill in form.skills" 
                  :key="skill"
                  class="px-3 py-1 bg-indie-primary border border-indie-border flex items-center gap-2 text-sm font-bold"
                >
                  {{ getSkillLabel(skill) }}
                  <button type="button" @click="removeSkill(skill)" class="text-gray-500 hover:text-red-500 ml-1">×</button>
                </span>
              </div>
              
              <div class="relative">
                <select 
                  @change="addSkill($event)" 
                  class="w-full px-4 py-2 border-2 border-indie-border bg-white appearance-none cursor-pointer hover:bg-gray-50"
                  :disabled="form.skills?.length >= 10"
                >
                  <option value="">+ 添加技能</option>
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
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
              </div>
            </div>

            <!-- 经验与偏好 -->
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-bold mb-2">经验年限</label>
                <input 
                  v-model.number="form.experience_years" 
                  type="number" 
                  min="0"
                  max="50"
                  class="w-full px-4 py-3 border-2 border-indie-border focus:outline-none focus:border-indie-text" 
                />
              </div>
              <div>
                <label class="block text-sm font-bold mb-2">工作偏好</label>
                <select 
                  v-model="form.work_preference" 
                  class="w-full px-4 py-3 border-2 border-indie-border bg-white"
                >
                  <option value="fulltime">全职</option>
                  <option value="parttime">兼职/外包</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold mb-2">所在地</label>
                <input 
                  v-model="form.location" 
                  type="text" 
                  class="w-full px-4 py-3 border-2 border-indie-border focus:outline-none focus:border-indie-text" 
                  placeholder="例如：北京" 
                />
              </div>
            </div>

            <!-- 联系方式（付费可见） -->
            <div class="pt-6 border-t-2 border-gray-100 bg-gray-50 p-4 -mx-4 md:mx-0 md:rounded-lg">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                🔒 本人联系方式
                <span class="text-xs font-normal bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">付费后对方可见</span>
              </h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold mb-2">微信号</label>
                  <input 
                    v-model="form.wechat_id" 
                    type="text" 
                    class="w-full px-4 py-3 border-2 border-indie-border focus:outline-none focus:border-indie-text" 
                    placeholder="请输入微信号" 
                  />
                </div>
                <div>
                  <label class="block text-sm font-bold mb-2">邮箱</label>
                  <input 
                    v-model="form.email" 
                    type="email" 
                    class="w-full px-4 py-3 border-2 border-indie-border focus:outline-none focus:border-indie-text" 
                    placeholder="常用邮箱" 
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <button 
                type="submit" 
                :disabled="isSaving"
                class="px-8 py-3 bg-indie-primary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSaving ? '保存中...' : '保存资料' }}
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
      groups[skill.category] = { label: skill.category.toUpperCase(), options: [] }
    }
    groups[skill.category].options.push(skill)
  })
  return Object.values(groups)
})

function getSkillLabel(value: string) {
  return SKILLS.find(s => s.value === value)?.label || value
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
    showMessage('头像上传成功')
  } catch (e: any) {
    showMessage(e.message || '头像上传失败', 'error')
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
    showMessage('资料已保存')
  } catch (e: any) {
    const errorMsg = e.data?.data?.errors 
      ? Object.values(e.data.data.errors).flat().join(', ')
      : (e.data?.message || '保存失败')
    showMessage(errorMsg, 'error')
  } finally {
    isSaving.value = false
  }
}

// 退出登录
async function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
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
  title: '个人中心 - 小概率',
  robots: 'noindex'
})
</script>

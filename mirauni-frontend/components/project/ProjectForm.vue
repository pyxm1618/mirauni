<template>
  <form @submit.prevent="handleSubmit" class="space-y-8">
    <!-- 基础信息 -->
    <div class="bg-white border-2 border-black p-6 shadow-brutal">
      <h3 class="text-xl font-bold mb-6 border-b-2 border-black pb-2">基础信息</h3>
      
      <div class="grid gap-6">
        <div>
          <label class="block font-bold mb-2">项目名称 *</label>
          <input v-model="form.title" type="text" placeholder="给你的项目起个响亮的名字" class="w-full px-4 py-2 border-2 border-black focus:outline-none focus:shadow-brutal-sm transition-all" />
          <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
        </div>

        <div>
          <label class="block font-bold mb-2">一句话简介 *</label>
          <input v-model="form.summary" type="text" placeholder="用一句话描述项目的核心价值 (10-50字)" class="w-full px-4 py-2 border-2 border-black focus:outline-none focus:shadow-brutal-sm transition-all" />
          <p v-if="errors.summary" class="text-red-500 text-sm mt-1">{{ errors.summary }}</p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block font-bold mb-2">项目分类 *</label>
            <select v-model="form.category" class="w-full px-4 py-2 border-2 border-black bg-white focus:outline-none focus:shadow-brutal-sm transition-all">
              <option value="" disabled>请选择分类</option>
              <option v-for="cat in PROJECT_CATEGORIES" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
            </select>
            <p v-if="errors.category" class="text-red-500 text-sm mt-1">{{ errors.category }}</p>
          </div>

          <div>
             <label class="block font-bold mb-2">合作方式 *</label>
            <select v-model="form.cooperation_type" class="w-full px-4 py-2 border-2 border-black bg-white focus:outline-none focus:shadow-brutal-sm transition-all">
              <option v-for="type in COOPERATION_TYPES" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>
             <p v-if="errors.cooperation_type" class="text-red-500 text-sm mt-1">{{ errors.cooperation_type }}</p>
          </div>
        </div>

        <div>
           <label class="block font-bold mb-2">工作模式 *</label>
           <div class="flex gap-4">
             <label v-for="mode in WORK_MODES" :key="mode.value" class="flex items-center cursor-pointer">
               <input type="radio" v-model="form.work_mode" :value="mode.value" class="mr-2 accent-black w-5 h-5" />
               {{ mode.label }}
             </label>
           </div>
           <p v-if="errors.work_mode" class="text-red-500 text-sm mt-1">{{ errors.work_mode }}</p>
        </div>

        <div>
          <label class="block font-bold mb-2">招募角色 (多选) *</label>
          <div class="flex flex-wrap gap-3">
            <button 
              type="button" 
              v-for="role in ROLES" 
              :key="role.value"
              @click="toggleRole(role.value)"
              class="px-3 py-1 border-2 text-sm transition-all"
              :class="form.roles_needed.includes(role.value) ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'"
            >
              {{ role.label }}
            </button>
          </div>
          <p v-if="errors.roles_needed" class="text-red-500 text-sm mt-1">{{ errors.roles_needed }}</p>
        </div>
      </div>
    </div>

    <!-- 详细介绍 -->
    <div class="bg-white border-2 border-black p-6 shadow-brutal">
      <div class="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
        <h3 class="text-xl font-bold">详细介绍</h3>
        <div class="text-sm text-gray-500">
           <label class="flex items-center cursor-pointer">
             <input type="checkbox" v-model="form.description_visible" class="mr-2 w-4 h-4 accent-black">
             公开可见
           </label>
        </div>
      </div>
      <div>
        <textarea v-model="form.description" rows="6" placeholder="详细介绍项目背景、痛点、解决方案..." class="w-full px-4 py-2 border-2 border-black focus:outline-none focus:shadow-brutal-sm transition-all"></textarea>
        <p v-if="errors.description" class="text-red-500 text-sm mt-1">{{ errors.description }}</p>
      </div>
    </div>
    
    <!-- 其他可选信息 (简化版，先只做核心的) -->
     <div class="bg-white border-2 border-black p-6 shadow-brutal">
      <div class="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
        <h3 class="text-xl font-bold">演示链接</h3>
         <div class="text-sm text-gray-500">
           <label class="flex items-center cursor-pointer">
             <input type="checkbox" v-model="form.demo_visible" class="mr-2 w-4 h-4 accent-black">
             公开可见
           </label>
        </div>
      </div>
      <div>
        <input v-model="form.demo_url" type="url" placeholder="https://..." class="w-full px-4 py-2 border-2 border-black focus:outline-none focus:shadow-brutal-sm transition-all" />
        <p v-if="errors.demo_url" class="text-red-500 text-sm mt-1">{{ errors.demo_url }}</p>
      </div>
    </div>

    <button type="submit" :disabled="loading" class="w-full bg-indie-primary border-2 border-black py-4 text-lg font-bold hover:shadow-brutal hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
      {{ loading ? '提交中...' : (isEdit ? '保存修改' : '发布项目') }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { PROJECT_CATEGORIES, ROLES, WORK_MODES, COOPERATION_TYPES, projectSchema } from '~/types'
import type { Project } from '~/types'

const props = defineProps<{
  initialData?: Partial<Project>
  loading?: boolean
  isEdit?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: any): void
}>()

const form = ref({
  title: '',
  summary: '',
  category: '',
  roles_needed: [] as string[],
  skills_required: [] as string[],
  work_mode: 'remote',
  cooperation_type: 'equity',
  description: '',
  description_visible: true,
  demo_url: '',
  demo_visible: false,
  // ... other fields simplified for now
})

const errors = ref<Record<string, string>>({})

onMounted(() => {
  if (props.initialData) {
    // Merge initial data
    Object.assign(form.value, {
       ...props.initialData,
       roles_needed: props.initialData.roles_needed || [],
       skills_required: props.initialData.skills_required || [],
    })
  }
})

const toggleRole = (role: string) => {
    const idx = form.value.roles_needed.indexOf(role)
    if(idx > -1) form.value.roles_needed.splice(idx, 1)
    else {
        if(form.value.roles_needed.length >= 5) return // Max 5 limit
        form.value.roles_needed.push(role)
    }
}

const validate = () => {
    const result = projectSchema.safeParse(form.value)
    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors
        errors.value = Object.fromEntries(
            Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] || ''])
        )
        // Scroll to first error?
        return false
    }
    errors.value = {}
    return true
}

const handleSubmit = () => {
    if(!validate()) return
    emit('submit', form.value)
}
</script>

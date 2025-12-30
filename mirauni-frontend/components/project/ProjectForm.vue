<template>
  <form @submit.prevent="handleSubmit" class="space-y-8">
    <!-- 基础信息 -->
    <div class="bg-white border-3 border-black p-6 shadow-brutal relative">
        <h3 class="text-2xl font-black mb-6 border-b-4 border-black pb-2 uppercase">{{ $t('project.create.basic') }}</h3>
      
      <div class="grid gap-6">
        <div>
          <label class="block font-black mb-2 uppercase text-sm tracking-wide">{{ $t('project.create.projectName') }}</label>
          <input v-model="form.title" type="text" :placeholder="$t('project.create.namePlaceholder')" class="w-full px-4 py-3 bg-gray-50 border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all placeholder-gray-400" />
          <p v-if="errors.title" class="text-red-600 font-bold text-sm mt-1 uppercase">{{ errors.title }}</p>
        </div>

        <div>
          <label class="block font-black mb-2 uppercase text-sm tracking-wide">{{ $t('project.create.summary') }}</label>
          <input v-model="form.summary" type="text" :placeholder="$t('project.create.summaryPlaceholder')" class="w-full px-4 py-3 bg-gray-50 border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all placeholder-gray-400" />
          <p v-if="errors.summary" class="text-red-600 font-bold text-sm mt-1 uppercase">{{ errors.summary }}</p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block font-black mb-2 uppercase text-sm tracking-wide">{{ $t('project.create.category') }}</label>
            <select v-model="form.category" class="w-full px-4 py-3 bg-white border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all cursor-pointer">
              <option value="" disabled>{{ $t('project.create.selectCategory') }}</option>
              <option v-for="cat in PROJECT_CATEGORIES" :key="cat.value" :value="cat.value">{{ $t('project.categories.' + cat.value) }}</option>
            </select>
            <p v-if="errors.category" class="text-red-600 font-bold text-sm mt-1 uppercase">{{ errors.category }}</p>
          </div>

          <div>
             <label class="block font-black mb-2 uppercase text-sm tracking-wide">{{ $t('project.create.cooperationType') }}</label>
            <select v-model="form.cooperation_type" class="w-full px-4 py-3 bg-white border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all cursor-pointer">
              <option v-for="type in COOPERATION_TYPES" :key="type.value" :value="type.value">{{ $t('project.cooperationTypes.' + type.value) }}</option>
            </select>
             <p v-if="errors.cooperation_type" class="text-red-600 font-bold text-sm mt-1 uppercase">{{ errors.cooperation_type }}</p>
          </div>
        </div>

        <div>
           <label class="block font-black mb-2 uppercase text-sm tracking-wide">{{ $t('project.create.workMode') }}</label>
           <div class="flex gap-4">
             <label v-for="mode in WORK_MODES" :key="mode.value" class="flex items-center cursor-pointer group">
               <input type="radio" v-model="form.work_mode" :value="mode.value" class="mr-2 appearance-none w-5 h-5 border-3 border-black bg-white checked:bg-black transition-all cursor-pointer" />
               <span class="font-bold group-hover:underline uppercase">{{ $t('project.workModes.' + mode.value) }}</span>
             </label>
           </div>
           <p v-if="errors.work_mode" class="text-red-600 font-bold text-sm mt-1 uppercase">{{ errors.work_mode }}</p>
        </div>

        <div>
          <label class="block font-black mb-2 uppercase text-sm tracking-wide">{{ $t('project.create.roles') }}</label>
          <div class="flex flex-wrap gap-3">
            <button 
              type="button" 
              v-for="role in ROLES" 
              :key="role.value"
              @click="toggleRole(role.value)"
              class="px-3 py-1 border-3 font-bold text-sm transition-all uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0)]"
              :class="form.roles_needed.includes(role.value) ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(100,100,100,1)] translate-x-[1px] translate-y-[1px]' : 'bg-white text-black border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'"
            >
              {{ $t('roles.' + role.value) }}
            </button>
          </div>
          <p v-if="errors.roles_needed" class="text-red-600 font-bold text-sm mt-1 uppercase">{{ errors.roles_needed }}</p>
        </div>
      </div>
    </div>

    <!-- 详细介绍 -->
    <div class="bg-white border-3 border-black p-6 shadow-brutal">
      <div class="flex items-center justify-between mb-6 border-b-4 border-black pb-2">
        <h3 class="text-2xl font-black uppercase">{{ $t('project.create.description') }}</h3>
        <div class="text-sm font-bold uppercase">
           <label class="flex items-center cursor-pointer">
             <input type="checkbox" v-model="form.description_visible" class="mr-2 w-5 h-5 border-3 border-black appearance-none checked:bg-black transition-all">
             {{ $t('project.create.publicVisible') }}
           </label>
        </div>
      </div>
      <div>
        <textarea v-model="form.description" rows="8" :placeholder="$t('project.create.descPlaceholder')" class="w-full px-4 py-3 bg-gray-50 border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all font-mono"></textarea>
        <p v-if="errors.description" class="text-red-600 font-bold text-sm mt-1 uppercase">{{ errors.description }}</p>
      </div>
    </div>
    
    <!-- 其他可选信息 (简化版，先只做核心的) -->
     <div class="bg-white border-3 border-black p-6 shadow-brutal">
      <div class="flex items-center justify-between mb-6 border-b-4 border-black pb-2">
        <h3 class="text-2xl font-black uppercase">{{ $t('project.create.demoUrl') }}</h3>
         <div class="text-sm font-bold uppercase">
           <label class="flex items-center cursor-pointer">
             <input type="checkbox" v-model="form.demo_visible" class="mr-2 w-5 h-5 border-3 border-black appearance-none checked:bg-black transition-all">
             {{ $t('project.create.publicVisible') }}
           </label>
        </div>
      </div>
      <div>
        <input v-model="form.demo_url" type="url" placeholder="HTTPS://..." class="w-full px-4 py-3 bg-gray-50 border-3 border-black font-bold focus:outline-none focus:shadow-brutal-hover transition-all" />
        <p v-if="errors.demo_url" class="text-red-600 font-bold text-sm mt-1 uppercase">{{ errors.demo_url }}</p>
      </div>
    </div>

    <button type="submit" :disabled="loading" class="w-full bg-indie-primary border-3 border-black py-4 text-xl font-black uppercase shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
      {{ loading ? $t('project.create.submitting') : (isEdit ? $t('project.create.save') : $t('project.create.submit')) }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { PROJECT_CATEGORIES, ROLES, WORK_MODES, COOPERATION_TYPES, projectSchema } from '~/types'
import type { Project } from '~/types'

const { t } = useI18n()

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

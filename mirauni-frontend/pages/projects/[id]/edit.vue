<template>
  <div class="container mx-auto px-4 py-12 max-w-4xl">
    <div class="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <h1 class="text-4xl font-black font-display uppercase border-b-4 border-black">EDIT PROJECT</h1>
         <!-- Delete/Close Button -->
         <button @click="onCloseProject" class="px-6 py-2 bg-red-100 text-red-600 font-black uppercase border-3 border-red-600 hover:bg-red-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] active:translate-y-1 active:translate-x-1 active:shadow-none">
            CLOSE PROJECT / 下架项目
         </button>
    </div>
    
    <div v-if="pending" class="text-center py-12 font-bold uppercase">LOADING...</div>
    <div v-else-if="!project" class="text-center py-12 text-red-600 font-bold border-3 border-red-600 bg-red-100 uppercase">PROJECT NOT FOUND</div>
    <ProjectForm v-else :initialData="project" :isEdit="true" @submit="onSubmit" :loading="saving" />
  </div>
</template>

<script setup lang="ts">
import ProjectForm from '~/components/project/ProjectForm.vue'
import type { Project } from '~/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = route.params.id

interface ProjectResponse {
  success: boolean
  data: Project
}

// Fetch existing data
const { data, pending } = await useFetch<ProjectResponse>(`/api/projects/${id}`)
const project = computed(() => data.value?.data)
const saving = ref(false)

const onSubmit = async (formData: any) => {
  saving.value = true
  try {
    await $fetch(`/api/projects/${id}`, {
      method: 'PUT' as any,
      body: formData
    })
    useRouter().push(`/projects/${id}`)
  } catch (e: any) {
    alert('保存失败: ' + (e.data?.message || e.message))
  } finally {
    saving.value = false
  }
}

const onCloseProject = async () => {
    if(!confirm('确定要下架该项目吗？下架后将不再显示在列表中，但数据会保留。')) return
    try {
        await $fetch(`/api/projects/${id}/close`, { method: 'POST' })
        alert('项目已下架')
        useRouter().push('/projects')
    } catch(e: any) {
        alert('操作失败: ' + (e.data?.message || e.message))
    }
}

useSeoMeta({
  title: '编辑项目 - 小概率'
})
</script>

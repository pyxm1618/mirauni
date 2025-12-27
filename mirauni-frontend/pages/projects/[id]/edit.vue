<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-display font-bold">编辑项目</h1>
         <!-- Delete/Close Button -->
         <button @click="onCloseProject" class="text-red-600 font-bold border-b-2 border-red-200 hover:border-red-600 transition-colors">
            下架项目
         </button>
    </div>
    
    <div v-if="pending" class="text-center py-12">加载中...</div>
    <div v-else-if="!project" class="text-center py-12 text-red-500">项目不存在或无法访问</div>
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
      method: 'PUT',
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

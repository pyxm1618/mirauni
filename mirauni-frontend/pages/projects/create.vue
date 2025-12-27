<template>
  <div class="container mx-auto px-4 py-12 max-w-4xl">
    <h1 class="text-4xl font-black font-display mb-8 uppercase text-center border-b-4 border-black inline-block mx-auto">LAUNCH NEW PROJECT</h1>
    <ProjectForm @submit="onSubmit" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import ProjectForm from '~/components/project/ProjectForm.vue'
import type { Project } from '~/types'

definePageMeta({
  middleware: 'auth'
})

interface CreateProjectResponse {
  success: boolean
  data: Project
}

const loading = ref(false)

const onSubmit = async (formData: any) => {
  loading.value = true
  try {
    const response = await $fetch<CreateProjectResponse>('/api/projects', {
      method: 'POST',
      body: formData
    })
    
    // Redirect to detail
    if (response.success && response.data?.id) {
       navigateTo(`/projects/${response.data.id}`)
    }
  } catch (e: any) {
    alert('发布失败: ' + (e.data?.message || e.message))
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: '发布项目 - 小概率',
  description: '发布你的创业项目，寻找技术合伙人'
})
</script>

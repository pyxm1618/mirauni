<template>
  <div class="container mx-auto px-4 py-12 max-w-4xl">
    <div class="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <h1 class="text-4xl font-black font-display uppercase border-b-4 border-black">{{ $t('project.edit.title') }}</h1>
         <!-- Delete/Close Button -->
         <button @click="onCloseProject" class="px-6 py-2 bg-red-100 text-red-600 font-black uppercase border-3 border-red-600 hover:bg-red-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] active:translate-y-1 active:translate-x-1 active:shadow-none">
            {{ $t('project.edit.close') }}
         </button>
    </div>
    
    <div v-if="pending" class="text-center py-12 font-bold uppercase">{{ $t('project.edit.loading') }}</div>
    <div v-else-if="!project" class="text-center py-12 text-red-600 font-bold border-3 border-red-600 bg-red-100 uppercase">{{ $t('project.edit.notFound') }}</div>
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
    alert(t('project.edit.saveFailed') + ': ' + (e.data?.message || e.message))
  } finally {
    saving.value = false
  }
}

const onCloseProject = async () => {
    if(!confirm(t('project.edit.closeConfirm'))) return
    try {
        await $fetch(`/api/projects/${id}/close`, { method: 'POST' })
        alert(t('project.edit.closed'))
        useRouter().push('/projects')
    } catch(e: any) {
        alert(t('project.edit.closeFailed') + ': ' + (e.data?.message || e.message))
    }
}

const { t } = useI18n()

useSeoMeta({
  title: t('project.edit.seoTitle')
})
</script>

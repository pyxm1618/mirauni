<template>
  <div class="space-y-8">
     <div class="flex justify-between items-center">
        <h1 class="text-3xl font-black">所有项目</h1>
        <UButton color="black" icon="i-lucide-plus">新建项目</UButton>
    </div>

    <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-32 bg-gray-50 rounded-xl animate-pulse"></div>
    </div>

    <div v-else class="space-y-8">
        <div v-for="path in paths" :key="path.id" class="space-y-4">
             <div class="flex items-center gap-2 border-b-2 border-gray-100 pb-2">
                <UBadge color="black" size="lg">{{ path.category }}</UBadge>
                <h2 class="text-2xl font-bold">{{ path.name }}</h2>
             </div>
             
             <div class="grid md:grid-cols-2 gap-4">
                 <div 
                    v-for="project in path.projects" 
                    :key="project.id"
                    class="bg-white border-3 border-black rounded-xl p-5 shadow-hard hover:shadow-hard-lg transition-transform cursor-pointer"
                 >
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-lg">{{ project.name }}</h3>
                        <UIcon name="i-lucide-arrow-up-right" class="w-5 h-5" />
                    </div>
                    <!-- Mini Task List -->
                     <div class="space-y-2">
                        <div v-for="task in project.tasks.slice(0, 3)" :key="task.id" class="flex items-center gap-2 text-sm text-gray-600">
                             <div class="w-1.5 h-1.5 rounded-full" :class="task.status==='done' ? 'bg-green-500' : 'bg-gray-300'"></div>
                             <span :class="{'line-through text-gray-400': task.status === 'done'}">{{ task.name }}</span>
                        </div>
                        <div v-if="project.tasks.length > 3" class="text-xs text-gray-400 pl-4">
                            ...还有 {{ project.tasks.length - 3 }} 个任务
                        </div>
                     </div>
                 </div>
             </div>
        </div>
        
        <div v-if="paths.length === 0" class="text-center py-12 text-gray-400">
             暂无项目，去向导里生成一个吧？
             <UButton to="/wizard" variant="soft" class="mt-4">开始规划</UButton>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
    // Auth is handled globally by auth.global.ts
})

const paths = ref<any[]>([])
const loading = ref(true)

async function fetchProjects() {
    loading.value = true
    try {
        // Fetch Paths with nested Projects and Tasks
        // Supabase nested query
        const client = useSupabaseClient()
        const { data } = await client
            .from('paths')
            .select(`
                *,
                projects (
                    *,
                    tasks (
                        name, status, id
                    )
                )
            `)
            .eq('status', 'active')
            .order('sort_order')
            
        if (data) paths.value = data
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchProjects()
})
</script>

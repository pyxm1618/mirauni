<template>
  <UModal v-model="isOpen">
    <div class="p-6 bg-white border-3 border-black shadow-hard rounded-xl">
      <div class="flex justify-between items-start mb-6">
        <h3 class="text-xl font-black">💰 记一笔收入</h3>
        <UButton 
            color="gray" variant="ghost" icon="i-lucide-x" size="sm" 
            @click="isOpen = false"
        />
      </div>

      <form @submit.prevent="save" class="space-y-4">
        <div>
            <label class="text-xs font-bold text-gray-500 uppercase">金额 (元)</label>
            <div class="flex items-center gap-2">
                <span class="text-2xl font-black text-gray-400">¥</span>
                <input 
                    v-model.number="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full text-3xl font-black border-b-2 border-gray-200 focus:border-black outline-none py-2 no-spinner"
                    autofocus
                />
            </div>
        </div>

        <div>
            <label class="text-xs font-bold text-gray-500 uppercase">备注 (可选)</label>
            <input 
                v-model="note"
                placeholder="例：项目A 第一笔收入"
                class="w-full text-base border-b-2 border-gray-200 focus:border-black outline-none py-2"
            />
        </div>

        <div>
            <label class="text-xs font-bold text-gray-500 uppercase">来源项目</label>
            <select 
                v-model="projectId"
                class="w-full text-base border-2 border-gray-200 focus:border-black outline-none py-2 px-2 rounded-lg"
            >
                <option value="">未关联项目</option>
                <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
        </div>

        <div class="pt-4">
            <UButton 
                type="submit" 
                block 
                color="black" 
                :loading="loading"
                :disabled="!amount || amount <= 0"
            >
                记录收入
            </UButton>
        </div>
      </form>
    </div>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'saved'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const amount = ref<number | null>(null)
const note = ref('')
const projectId = ref('')
const loading = ref(false)
const projects = ref<any[]>([])

async function loadProjects() {
    try {
        const data = await $fetch('/api/projects')
        projects.value = data as any[]
    } catch (e) {
        console.error('Failed to load projects', e)
    }
}

const toast = useToast()

async function save() {
    if (!amount.value || amount.value <= 0) return
    
    loading.value = true
    try {
        await $fetch('/api/income', {
            method: 'POST',
            body: { 
                amount: amount.value,
                note: note.value,
                project_id: projectId.value || null
            }
        })
        emit('saved')
        
        toast.add({
            title: '💰 记录成功',
            description: `成功记录收入 ¥${amount.value}`,
            color: 'green'
        })

        amount.value = null
        note.value = ''
        projectId.value = ''
        isOpen.value = false
    } catch (e) {
        console.error('Failed to save income', e)
        toast.add({
            title: '保存失败',
            description: '请重试',
            color: 'red'
        })
    } finally {
        loading.value = false
    }
}

// Load projects when modal opens
watch(isOpen, (val) => {
    if (val) {
        amount.value = null
        note.value = ''
        projectId.value = ''
        loadProjects()
    }
})
</script>

<style scoped>
.no-spinner::-webkit-inner-spin-button, 
.no-spinner::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
.no-spinner {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>

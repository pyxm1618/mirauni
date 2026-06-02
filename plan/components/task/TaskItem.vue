<template>
  <div 
    class="flex items-center gap-3 p-3 bg-white border-2 border-black shadow-hard-sm rounded-lg group hover:bg-toon-50 transition-colors cursor-pointer"
    @click="$emit('click')"
  >
    <!-- Checkbox -->
    <div 
      @click.stop="toggle"
      class="w-6 h-6 border-2 border-black rounded-md flex items-center justify-center transition-colors flex-shrink-0"
      :class="isDone ? 'bg-black' : 'bg-white hover:bg-gray-100'"
    >
      <UIcon v-if="isDone" name="i-lucide-check" class="text-white w-4 h-4" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div 
        class="font-bold text-base truncate transition-opacity"
        :class="isDone ? 'line-through text-gray-400' : 'text-black'"
      >
        {{ task.name }}
      </div>
      <div class="flex items-center gap-2 mt-0.5">
          <!-- Project Tag -->
          <span v-if="task.projects" class="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 border border-black rounded text-gray-600 truncate max-w-[120px]">
              {{ task.projects.name }}
          </span>
          <!-- Path Tag -->
           <span v-if="task.projects?.paths" class="text-[10px] text-gray-400">
              #{{ task.projects.paths.category }}
           </span>
      </div>
    </div>

    <!-- Action -->
    <UIcon name="i-lucide-chevron-right" class="text-gray-300 group-hover:text-black w-5 h-5" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  task: any
}>()

const emit = defineEmits(['toggle', 'click'])

const isDone = computed(() => props.task.status === 'done')

function toggle() {
  emit('toggle', props.task)
}
</script>

<template>
  <div 
    @click="toggle"
    class="cursor-pointer border-3 rounded-xl p-4 transition-all duration-200 flex items-start gap-3 group relative overflow-hidden"
    :class="[
      modelValue === value || (Array.isArray(modelValue) && modelValue.includes(value))
        ? 'border-black bg-toon-100 shadow-hard' 
        : 'border-gray-200 bg-white hover:border-black hover:shadow-hard-sm'
    ]"
  >
    <!-- Radio/Checkbox Indicator -->
    <div 
      class="w-6 h-6 border-3 flex items-center justify-center bg-white flex-shrink-0 mt-0.5 transition-all"
      :class="[
        isSelected ? 'border-black' : 'border-gray-300',
        multiple ? 'rounded-lg' : 'rounded-full'
      ]"
    >
      <div v-if="isSelected" class="bg-black" :class="multiple ? 'w-3 h-3 rounded-sm' : 'w-2.5 h-2.5 rounded-full'" />
    </div>

    <!-- Content -->
    <div class="flex-1">
      <h4 class="font-bold text-lg leading-tight" :class="isSelected ? 'text-black' : 'text-gray-900'">
        <slot name="title">{{ label }}</slot>
      </h4>
      <p v-if="$slots.description || description" class="text-sm text-gray-500 mt-1 font-medium">
        <slot name="description">{{ description }}</slot>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: any
  value: any
  label?: string
  description?: string
  multiple?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const isSelected = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(props.value)
  }
  return props.modelValue === props.value
})

function toggle() {
  if (props.multiple) {
    const newValue = [...(props.modelValue as any[])]
    const idx = newValue.indexOf(props.value)
    if (idx === -1) {
      newValue.push(props.value)
    } else {
      newValue.splice(idx, 1)
    }
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', props.value)
  }
}
</script>

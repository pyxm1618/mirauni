<template>
  <button 
    :class="[
      'px-6 py-3 border-2 border-indie-border font-bold transition-all',
      variantClasses,
      sizeClasses,
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-indie-primary shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px]',
    secondary: 'bg-white shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px]',
    ghost: 'bg-transparent hover:bg-gray-100'
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  }
  return sizes[props.size]
})
</script>

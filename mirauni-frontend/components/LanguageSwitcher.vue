<template>
  <NuxtLink 
    :to="switchLocalePath(targetLocale)"
    class="px-3 py-1 font-bold uppercase border-2 border-transparent hover:border-black hover:bg-gray-100 transition-all text-sm"
  >
    {{ targetLocale === 'zh' ? '中' : 'EN' }}
  </NuxtLink>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const targetLocale = computed(() => {
  return locale.value === 'zh' ? 'en' : 'zh'
})
</script>

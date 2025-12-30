<template>
  <div class="bg-white border-3 border-black shadow-hard rounded-xl p-4 flex flex-col justify-between h-full relative overflow-hidden group hover:translate-y-[-2px] transition-transform">
    <!-- Icon/Label -->
    <div class="flex justify-between items-start mb-2">
      <span class="text-gray-500 font-bold text-sm uppercase tracking-wider">{{ label }}</span>
      <UIcon :name="icon" class="w-5 h-5 text-black" />
    </div>

    <!-- Value -->
    <div class="flex items-baseline gap-1">
      <span class="text-3xl font-black text-black">{{ value }}</span>
      <span v-if="unit" class="text-xs text-gray-400 font-bold">{{ unit }}</span>
    </div>

    <!-- Subtext or Progress -->
    <div class="mt-3">
        <div v-if="hasProgress" class="w-full h-2 bg-gray-100 rounded-full border-2 border-black overflow-hidden">
            <div class="h-full bg-toon-400 border-r-2 border-black" :style="{ width: progress + '%' }"></div>
        </div>
        <p v-else-if="subtext" class="text-xs text-gray-400 font-medium truncate">
            {{ subtext }}
        </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  unit?: string
  icon?: string
  subtext?: string
  hasProgress?: boolean
  progress?: number
}>()
</script>

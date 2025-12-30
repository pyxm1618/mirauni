<template>
  <UPopover mode="click">
    <UButton
      icon="i-lucide-grid-3x3"
      color="white"
      variant="ghost"
      class="border-3 border-transparent hover:border-black hover:bg-gray-100 rounded-lg w-12 h-12 flex items-center justify-center p-0 transition-all"
    />
    
    <template #panel>
      <div class="p-4 w-72 border-0"> 
        <!-- Note: The Popover panel usually has its own styling. 
             If we want strict Toon style for popovers, we might need global CSS or deep overrides.
             For now, we rely on Nuxt UI config. -->
        <h3 class="font-bold mb-3 px-1">MIRAUNI UNIVERSE</h3>
        <div class="grid grid-cols-3 gap-2">
          <a href="https://mirauni.com" class="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors group">
            <div class="w-10 h-10 bg-black text-white rounded-md flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">Main</div>
            <span class="text-xs mt-1 font-medium">主站</span>
          </a>
          <a href="https://dev.mirauni.com" class="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors group">
            <div class="w-10 h-10 bg-blue-500 text-white rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
               <UIcon name="i-lucide-code" class="w-5 h-5" />
            </div>
            <span class="text-xs mt-1 font-medium">开发者</span>
          </a>
          <a href="https://plan.mirauni.com" class="flex flex-col items-center p-2 rounded-lg bg-toon-100 border-2 border-black">
            <div class="w-10 h-10 bg-toon-500 text-white rounded-md flex items-center justify-center">
               <UIcon name="i-lucide-rocket" class="w-5 h-5" />
            </div>
            <span class="text-xs mt-1 font-bold">钱途</span>
          </a>
          <!-- More apps... -->
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
// App Switcher logic
</script>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-indie-bg text-indie-text selection:bg-indie-primary selection:text-black">
    <NavBar class="border-b-3 border-black relative z-50 bg-white" />
    <main class="flex-grow p-4 sm:p-8">
      <router-view />
    </main>
    <footer class="bg-white border-t-3 border-black py-12 mt-12">
        <div class="max-w-7xl mx-auto px-4 text-center font-bold font-mono">
             MIRAUNI © {{ new Date().getFullYear() }} // BUILT_BY_INDEPENDENT_MINDS
        </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const isOpen = ref(false)
</script>

<template>
  <nav class="">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-20">
        <div class="flex items-center">
          <RouterLink to="/" class="flex-shrink-0 flex items-center gap-2 group transform active:translate-y-1 transition-transform">
             <div class="w-10 h-10 bg-indie-primary border-3 border-black shadow-brutal flex items-center justify-center font-bold text-xl">M</div>
             <span class="font-display font-black text-2xl tracking-tight uppercase group-hover:underline decoration-4 decoration-indie-accent">Mirauni</span>
          </RouterLink>
          <div class="hidden sm:ml-12 sm:flex sm:space-x-8">
            <RouterLink to="/" class="text-black hover:text-black px-3 py-2 text-lg font-bold border-b-4 border-transparent hover:border-indie-primary transition-all">
              EXPLORE
            </RouterLink>
            <RouterLink to="/projects" class="text-black hover:text-black px-3 py-2 text-lg font-bold border-b-4 border-transparent hover:border-indie-secondary transition-all">
              PROJECTS
            </RouterLink>
            <RouterLink to="/talent" class="text-black hover:text-black px-3 py-2 text-lg font-bold border-b-4 border-transparent hover:border-indie-accent transition-all">
              TALENT
            </RouterLink>
          </div>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
          <RouterLink to="/login" class="text-black font-bold text-lg hover:bg-indie-primary px-3 py-1 border-2 border-transparent transition-colors">
            LOG_IN
          </RouterLink>
          <RouterLink to="/register" class="bg-indie-secondary border-3 border-black text-black px-6 py-2 text-lg font-bold shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:shadow-brutal-active active:translate-x-[4px] active:translate-y-[4px]">
            JOIN_NOW
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>

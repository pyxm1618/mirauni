<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-5xl font-black font-display mb-12 uppercase">MY PROJECTS</h1>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- 侧边栏 -->
      <aside class="lg:col-span-1">
        <nav class="bg-white border-3 border-black shadow-brutal sticky top-8">
          <NuxtLink to="/me" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
            PROFILE
          </NuxtLink>
          <NuxtLink to="/me/projects" class="block px-6 py-4 border-b-3 border-black font-black uppercase bg-indie-primary hover:bg-indie-accent transition-colors">
            MY PROJECTS / 项目
          </NuxtLink>
          <NuxtLink to="/me/messages" class="block px-6 py-4 border-b-3 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
            MESSAGES
          </NuxtLink>
          <NuxtLink to="/me/recharge" class="block px-6 py-4 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors">
            RECHARGE
          </NuxtLink>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="lg:col-span-3">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b-4 border-black pb-6">
          <h2 class="text-3xl font-black uppercase">PROJECT LIST</h2>
          <NuxtLink to="/projects/create" class="px-8 py-3 bg-indie-primary border-3 border-black shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-black uppercase flex items-center gap-2">
            <span>+</span> LAUNCH NEW
          </NuxtLink>
        </div>

        <!-- 项目列表 -->
        <div class="space-y-6">
          <div v-for="i in 3" :key="i" class="bg-white border-3 border-black shadow-brutal p-6 hover:shadow-brutal-hover transition-all group">
            <div class="flex flex-col md:flex-row justify-between items-start gap-6">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <span class="px-3 py-1 text-sm font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :class="i === 1 ? 'bg-green-300' : (i === 2 ? 'bg-yellow-300' : 'bg-gray-300')">
                    {{ i === 1 ? 'RECRUITING' : (i === 2 ? 'PENDING' : 'CLOSED') }}
                  </span>
                  <span class="px-3 py-1 bg-indie-secondary border-2 border-black text-xs font-black uppercase">SAAS TOOL</span>
                </div>
                <h3 class="text-2xl font-black mb-3 uppercase group-hover:text-indie-primary transition-colors">MY COOL PROJECT {{ i }}</h3>
                <p class="text-gray-600 font-bold mb-4 line-clamp-2">A SHORT DESCRIPTION OF THE PROJECT GOES HERE...</p>
                <div class="text-xs font-bold text-gray-400 uppercase font-mono border-t-2 border-dashed border-gray-300 pt-3">
                  VIEWS: 128 · POSTED: 3 DAYS AGO
                </div>
              </div>
              <div class="flex gap-4 w-full md:w-auto">
                <button class="flex-1 md:flex-none px-6 py-2 border-3 border-black font-black uppercase hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                  EDIT
                </button>
                <button class="flex-1 md:flex-none px-6 py-2 border-3 border-black font-black uppercase text-red-600 hover:bg-red-600 hover:text-white transition-all bg-red-50 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                  {{ i === 3 ? 'DELETE' : 'CLOSE' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 无项目时 -->
        <div v-if="false" class="bg-white border-3 border-black shadow-brutal p-20 text-center">
          <div class="text-8xl mb-6 grayscale opacity-20 font-black">/</div>
          <p class="text-2xl font-black text-gray-400 uppercase mb-8">NO PROJECTS YET</p>
          <NuxtLink to="/projects/create" class="inline-block px-8 py-3 bg-indie-primary border-3 border-black shadow-brutal hover:shadow-brutal-hover transform transition-all font-black uppercase">
            LAUNCH FIRST PROJECT
          </NuxtLink>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: '我的项目 - 小概率',
  robots: 'noindex'
})
</script>

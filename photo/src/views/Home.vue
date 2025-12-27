<script setup lang="ts">
import { ref } from 'vue'

const projects = ref([
    {
        id: 1,
        title: "E-COM ANALYTICS",
        description: "Real-time dashboard. Sales tracking. Big Data.",
        tags: ["VUE", "D3", "NODE"],
        author: "SARAH_J",
        likes: 128,
        color: "bg-indie-primary"
    },
    {
        id: 2,
        title: "MINDFUL_APP",
        description: "Breathe in. Breathe out. Code better.",
        tags: ["REACT", "FASTAPI"],
        author: "DAVID_C",
        likes: 95,
        color: "bg-indie-secondary"
    },
    {
        id: 3,
        title: "WEB3_VAULT",
        description: "Crypto storage. No centralized nonsense.",
        tags: ["WEB3", "SOLIDITY"],
        author: "ELENA_R",
        likes: 210,
        color: "bg-indie-accent"
    }
])
</script>

<template>
  <div class="space-y-20 pb-20">
    <!-- Hero -->
    <section class="max-w-7xl mx-auto pt-16 sm:pt-24 pb-16 text-center">
        <div class="inline-block bg-indie-accent border-3 border-black px-4 py-2 font-bold transform -rotate-2 mb-8 shadow-brutal">
            🚀 SHIP FASTER
        </div>
        <h1 class="text-6xl sm:text-8xl font-black mb-8 leading-none">
            BUILD.<br/>
            <span class="text-indie-secondary" style="-webkit-text-stroke: 3px black; text-stroke: 3px black;">CONNECT.</span><br/>
            LAUNCH.
        </h1>
        <p class="text-xl sm:text-2xl font-bold max-w-3xl mx-auto mb-10 border-l-4 border-black pl-6 text-left ml-auto mr-auto bg-white p-4 shadow-brutal">
            Access the underground network of independent developers. No suits. Just code.
        </p>
        <div class="flex justify-center flex-wrap gap-6">
            <button class="bg-indie-primary border-3 border-black px-10 py-5 text-xl font-black shadow-brutal-lg hover:shadow-brutal-hover hover:translate-x-[6px] hover:translate-y-[6px] transition-all active:shadow-brutal-active">
                START PROJECT
            </button>
            <button class="bg-white border-3 border-black px-10 py-5 text-xl font-bold shadow-brutal-lg hover:shadow-brutal-hover hover:translate-x-[6px] hover:translate-y-[6px] transition-all active:shadow-brutal-active">
                BROWSE TALENT
            </button>
        </div>
    </section>

    <!-- Projects -->
    <section class="max-w-7xl mx-auto">
        <div class="flex justify-between items-end mb-10 border-b-4 border-black pb-4">
             <h2 class="text-4xl font-black uppercase">Fresh Drops</h2>
             <a href="#" class="font-bold text-lg hover:bg-indie-primary px-2 transition-colors">See All -></a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div v-for="project in projects" :key="project.id" class="bg-white border-3 border-black p-6 shadow-brutal hover:shadow-brutal-lg transition-all hover:-translate-y-2">
                <div class="flex justify-between items-start mb-4">
                     <div class="w-12 h-12 border-3 border-black flex items-center justify-center font-bold text-lg" :class="project.color">
                         {{ project.author[0] }}
                     </div>
                     <span class="border-2 border-black px-2 py-1 font-bold text-xs uppercase tracking-wider">Featured</span>
                </div>
                
                <h3 class="text-2xl font-black mb-3 uppercase leading-tight">{{ project.title }}</h3>
                <p class="font-medium text-gray-700 mb-6 border-l-4 border-gray-200 pl-3">{{ project.description }}</p>
                
                <div class="flex flex-wrap gap-2 mb-6">
                    <span v-for="tag in project.tags" :key="tag" class="bg-black text-white px-3 py-1 font-bold text-sm transform hover:-rotate-2 transition-transform cursor-default">
                        #{{ tag }}
                    </span>
                </div>
                
                <div class="pt-4 border-t-3 border-black flex justify-between items-center">
                    <span class="font-bold">Liked by {{ project.likes }}</span>
                    <button class="bg-indie-primary border-2 border-black px-4 py-1 font-bold text-sm shadow-[2px_2px_0px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                        VIEW
                    </button>
                </div>
            </div>
        </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedTag = ref('ALL')

const tags = ['ALL', 'VUE', 'REACT', 'NODE', 'WEB3', 'MOBILE', 'AI']

const projects = ref([
    { id: 1, title: "E-COM ANALYTICS", description: "Real-time dashboard.", tags: ["VUE", "NODE"], author: "SARAH", likes: 128, color: "bg-indie-primary" },
    { id: 2, title: "MINDFUL APP", description: "Meditation & Peace.", tags: ["REACT"], author: "DAVID", likes: 95, color: "bg-indie-secondary" },
    { id: 3, title: "WEB3 VAULT", description: "Decentralized storage.", tags: ["WEB3"], author: "ELENA", likes: 210, color: "bg-indie-accent" },
    { id: 4, title: "AI CHATBOT", description: "Smart customer support.", tags: ["AI", "PYTHON"], author: "ALEX", likes: 340, color: "bg-green-400" },
    { id: 5, title: "NATIVE WEATHER", description: "Precise forecasts.", tags: ["MOBILE"], author: "TOM", likes: 88, color: "bg-purple-400" },
    { id: 6, title: "TASK MASTER", description: "Get things done.", tags: ["VUE"], author: "JENNY", likes: 150, color: "bg-orange-400" },
])

const filteredProjects = computed(() => {
    return projects.value.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesTag = selectedTag.value === 'ALL' || p.tags.includes(selectedTag.value)
        return matchesSearch && matchesTag
    })
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
      <div class="mb-12 border-b-4 border-black pb-8">
          <h1 class="text-6xl font-black uppercase mb-8">Projects Square</h1>
          
          <div class="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <!-- Brutalist Search -->
              <div class="relative w-full md:w-1/2">
                  <div class="absolute inset-0 bg-black translate-x-1 translate-y-1"></div>
                  <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="SEARCH_PROJECTS..." 
                    class="relative w-full bg-white border-3 border-black p-4 font-bold text-xl focus:outline-none placeholder-gray-400 uppercase"
                  />
              </div>
              
              <!-- Tag Toggles -->
              <div class="flex flex-wrap gap-3">
                  <button 
                    v-for="tag in tags" 
                    :key="tag"
                    @click="selectedTag = tag"
                    class="border-3 border-black px-4 py-2 font-bold text-sm hover:shadow-brutal-hover transition-all uppercase"
                    :class="selectedTag === tag ? 'bg-black text-white shadow-brutal' : 'bg-white text-black'"
                  >
                      {{ tag }}
                  </button>
              </div>
          </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="project in filteredProjects" :key="project.id" class="bg-white border-3 border-black p-5 shadow-brutal hover:shadow-brutal-lg transition-all hover:-translate-y-1 flex flex-col h-full group">
              <div class="flex justify-between items-start mb-4">
                  <div class="w-10 h-10 border-3 border-black flex items-center justify-center font-bold" :class="project.color">
                      {{ project.author[0] }}
                  </div>
                  <div class="bg-black text-white px-2 py-0.5 text-xs font-bold">ID:{{ project.id.toString().padStart(3, '0') }}</div>
              </div>
              
              <h3 class="text-xl font-black uppercase leading-tight mb-2 group-hover:underline decoration-4 decoration-indie-accent">{{ project.title }}</h3>
              <p class="text-sm font-medium text-gray-600 mb-4 flex-grow border-l-2 border-gray-300 pl-2">{{ project.description }}</p>
              
              <div class="flex flex-wrap gap-1 mb-4">
                  <span v-for="tag in project.tags" :key="tag" class="border border-black px-1.5 py-0.5 text-[10px] font-bold uppercase bg-gray-100">
                      {{ tag }}
                  </span>
              </div>
              
              <button class="w-full border-3 border-black py-2 font-black text-sm hover:bg-indie-primary hover:shadow-brutal-hover transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                  VIEW_DETAILS
              </button>
          </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredProjects.length === 0" class="text-center py-20 bg-white border-3 border-black shadow-brutal">
          <h3 class="text-4xl font-black mb-4">NO_RESULTS_FOUND</h3>
          <p class="text-xl font-bold text-gray-500">TRY_DIFFERENT_KEYWORDS</p>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const searchQuery = ref('')
const selectedSkill = ref('ALL')

const skills = ['ALL', 'FRONTEND', 'BACKEND', 'DESIGN', 'WEB3', 'AI']

const developers = ref([
    { id: 101, name: "ALEX_C.", role: "FULLSTACK_DEV", rate: "$80/HR", skills: ["VUE", "NODE", "TS"], bio: "Building scalable web apps.", unlocked: false, contact: "alex@example.com" },
    { id: 102, name: "KATIE_D.", role: "UI_DESIGNER", rate: "$65/HR", skills: ["FIGMA", "CSS", "ART"], bio: "Pixel perfect designs.", unlocked: false, contact: "katie@design.io" },
    { id: 103, name: "MIKE_R.", role: "BLOCKCHAIN_ENG", rate: "$120/HR", skills: ["SOLIDITY", "RUST", "WEB3"], bio: "Smart contracts expert.", unlocked: false, contact: "mike@crypto.eth" },
    { id: 104, name: "SARAH_J.", role: "AI_RESEARCHER", rate: "$150/HR", skills: ["PYTHON", "PYTORCH", "AI"], bio: "ML models & NLP.", unlocked: false, contact: "sarah@ai.lab" },
    { id: 105, name: "CHRIS_P.", role: "MOBILE_DEV", rate: "$90/HR", skills: ["FLUTTER", "DART", "IOS"], bio: "Cross-platform apps.", unlocked: false, contact: "chris@mobile.dev" },
    { id: 106, name: "EMMA_W.", role: "BACKEND_DEV", rate: "$85/HR", skills: ["GO", "SQL", "DOCKER"], bio: "High performance APIs.", unlocked: false, contact: "emma@server.net" },
])

const filteredDevelopers = computed(() => {
    return developers.value.filter(dev => {
        const matchesSearch = dev.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || dev.role.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesSkill = selectedSkill.value === 'ALL' || dev.skills.some(s => s === selectedSkill.value) || (selectedSkill.value === 'FRONTEND' && dev.skills.includes('VUE')) // Simple mapping for demo
        return matchesSearch
    })
})

const unlockContact = (dev: any) => {
    if (!dev.unlocked) {
        if(confirm(`UNLOCK CONTACT FOR 50 POINTS?`)) {
            dev.unlocked = true
        }
    }
}
</script>

<template>
  <div class="max-w-7xl mx-auto">
      <div class="mb-12">
          <h1 class="text-7xl font-black uppercase mb-6 tracking-tighter">Talent Hunt</h1>
          
          <div class="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between border-b-4 border-black pb-8">
              <!-- Brutalist Search -->
              <div class="w-full md:w-1/2">
                  <label class="block font-black text-xl mb-2 bg-black text-white inline-block px-2">FIND_DEV:</label>
                  <div class="relative">
                      <div class="absolute inset-0 bg-indie-accent translate-x-2 translate-y-2 border-2 border-black"></div>
                      <input 
                        v-model="searchQuery"
                        type="text" 
                        placeholder="NAME OR ROLE..." 
                        class="relative w-full bg-white border-3 border-black p-4 font-bold text-xl focus:outline-none placeholder-gray-400 uppercase focus:translate-x-1 focus:translate-y-1 transition-transform"
                      />
                  </div>
              </div>
              
              <!-- Skill Filter -->
              <div class="flex flex-wrap gap-2 justify-end">
                  <button 
                    v-for="skill in skills" 
                    :key="skill"
                    @click="selectedSkill = skill"
                    class="border-3 border-black px-3 py-1 font-black text-sm uppercase transition-all hover:-translate-y-1"
                    :class="selectedSkill === skill ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' : 'bg-white text-black hover:bg-gray-100'"
                  >
                      {{ skill }}
                  </button>
              </div>
          </div>
      </div>

      <!-- Dev Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="dev in filteredDevelopers" :key="dev.id" class="relative group">
              <!-- Shadow/Background Element -->
              <div class="absolute inset-0 bg-black translate-x-3 translate-y-3"></div>
              
              <!-- Card Content -->
              <div class="relative bg-white border-3 border-black p-6 h-full flex flex-col transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1">
                  <!-- Header -->
                  <div class="flex justify-between items-start mb-4 border-b-3 border-black pb-4">
                      <div>
                          <h2 class="text-3xl font-black uppercase leading-none">{{ dev.name }}</h2>
                          <div class="text-indie-primary font-black bg-black text-white inline-block px-1 mt-1">{{ dev.role }}</div>
                      </div>
                      <div class="text-xl font-bold">{{ dev.rate }}</div>
                  </div>
                  
                  <!-- Bio -->
                  <p class="font-bold text-gray-600 mb-6 flex-grow">"{{ dev.bio }}"</p>
                  
                  <!-- Skills -->
                  <div class="flex flex-wrap gap-2 mb-6">
                      <span v-for="skill in dev.skills" :key="skill" class="bg-gray-200 border-2 border-black px-2 py-0.5 text-xs font-black">
                          {{ skill }}
                      </span>
                  </div>
                  
                  <!-- Action -->
                  <button 
                    @click="unlockContact(dev)"
                    class="w-full border-3 border-black py-3 font-black text-lg transition-all flex items-center justify-center gap-2"
                    :class="dev.unlocked ? 'bg-green-400 text-black cursor-default' : 'bg-indie-secondary hover:bg-indie-accent active:translate-y-1 active:translate-x-1'"
                  >
                      <span v-if="!dev.unlocked">🔓 UNLOCK_CONTACT (50P)</span>
                      <span v-else>✅ {{ dev.contact }}</span>
                  </button>
              </div>
          </div>
      </div>
  </div>
</template>

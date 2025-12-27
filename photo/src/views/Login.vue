<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')

const handleLogin = () => {
    router.push('/')
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="bg-white border-3 border-black p-8 sm:p-12 shadow-brutal-lg max-w-lg w-full transform rotate-1 hover:rotate-0 transition-transform duration-300">
        <h2 class="text-4xl font-black mb-8 border-b-4 border-indie-accent pb-2 inline-block">LOGIN.</h2>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
                <label class="block font-bold mb-2 uppercase text-sm tracking-wider">Email Address</label>
                <input v-model="email" type="email" class="w-full bg-gray-50 border-3 border-black p-4 font-bold focus:shadow-brutal focus:outline-none focus:bg-indie-secondary/20 transition-all placeholder-gray-400" placeholder="YOU@EXAMPLE.COM" />
            </div>
            
            <div>
                <label class="block font-bold mb-2 uppercase text-sm tracking-wider">Password</label>
                <input v-model="password" type="password" class="w-full bg-gray-50 border-3 border-black p-4 font-bold focus:shadow-brutal focus:outline-none focus:bg-indie-secondary/20 transition-all" placeholder="********" />
            </div>
            
            <button class="w-full bg-black text-white border-3 border-black p-4 text-xl font-bold shadow-brutal hover:bg-indie-primary hover:text-black hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-brutal-active active:translate-x-[4px] active:translate-y-[4px] transition-all mt-4">
                ENTER SYSTEM
            </button>
        </form>
        
        <div class="mt-8 text-center font-bold">
            <a href="#" class="border-b-2 border-black hover:bg-indie-accent px-1">Forgot Password?</a>
        </div>
    </div>
  </div>
</template>

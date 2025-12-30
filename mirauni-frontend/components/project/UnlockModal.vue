<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] max-w-md w-full p-8 transition-transform transform scale-100">
        <!-- Close Button -->
        <button @click="$emit('close')" class="absolute top-4 right-4 text-2xl font-black hover:scale-110 transition-transform">&times;</button>
        
        <h2 class="text-3xl font-black uppercase mb-8 text-center bg-yellow-300 border-2 border-black inline-block px-4 py-1 mx-auto rotate-1 shadow-brutal">
            {{ $t('project.unlock.title') }}
        </h2>
        
        <div class="space-y-6 text-center">
            <div class="flex justify-between items-center border-b-2 border-black pb-4 border-dashed">
                <span class="font-bold uppercase text-gray-500">{{ $t('project.unlock.cost') }}</span>
                <span class="font-black text-xl">1 {{ $t('project.unlock.credit') }}</span>
            </div>
            
            <div class="flex justify-between items-center border-b-2 border-black pb-4 border-dashed">
                <span class="font-bold uppercase text-gray-500">{{ $t('project.unlock.balance') }}</span>
                <span class="font-black text-xl" :class="{'text-red-500': credits < cost, 'text-green-600': credits >= cost}">
                    {{ credits }} {{ credits !== 1 ? $t('project.unlock.credits') : $t('project.unlock.credit') }}
                </span>
            </div>
            
            <div v-if="credits < cost" class="bg-red-100 border-2 border-red-500 p-4 text-red-600 font-bold uppercase text-sm">
                ⚠️ {{ $t('project.unlock.insufficient') }}
            </div>
            
            <div class="pt-4 flex gap-4">
                <button 
                    v-if="credits >= cost"
                    @click="$emit('confirm')" 
                    :disabled="loading"
                    class="flex-1 bg-black text-white border-2 border-black py-4 font-black uppercase hover:bg-indie-primary hover:text-black hover:shadow-brutal transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                >
                    {{ loading ? $t('project.unlock.processing') : $t('project.unlock.confirm') }}
                </button>
                
                <button 
                    v-else
                    @click="$emit('recharge')" 
                    class="flex-1 bg-indie-primary text-black border-2 border-black py-4 font-black uppercase hover:shadow-brutal transition-all text-xl"
                >
                    {{ $t('project.unlock.recharge') }}
                </button>
            </div>
            
            <button @click="$emit('close')" class="text-sm text-gray-400 font-bold uppercase hover:text-black underline decoration-2 decoration-gray-300 hover:decoration-black">
                {{ $t('project.unlock.cancel') }}
            </button>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  credits: number
  cost: number
  loading?: boolean
}>()

defineEmits(['close', 'confirm', 'recharge'])
</script>

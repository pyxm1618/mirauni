<template>
  <div class="min-h-screen bg-indie-bg flex flex-col items-center justify-center p-4">
    <div class="max-w-md w-full text-center">
      <div class="text-9xl mb-4 animate-bounce">
        {{ error.statusCode === 404 ? '🛸' : '🔧' }}
      </div>
      
      <div class="bg-white border-3 border-black p-8 shadow-brutal relative overflow-hidden">
        <div class="absolute top-0 right-0 p-2 opacity-10 text-4xl font-black">
           {{ error.statusCode }}
        </div>

        <h1 class="text-3xl font-black uppercase mb-4">
          {{ errorTitle }}
        </h1>
        
        <p class="text-xl font-bold text-gray-600 mb-8 border-l-4 border-indie-secondary pl-4 text-left">
          {{ errorMessage }}
        </p>

        <div class="flex flex-col gap-3">
          <button @click="handleError" class="w-full py-3 bg-black text-white font-black hover:bg-indie-accent hover:text-black transition-all border-2 border-black uppercase text-lg">
             {{ $t('common.back') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: Object
})

const { t } = useI18n()

const errorTitle = computed(() => {
  if (props.error.statusCode === 404) return 'Oops!'
  return 'Houston, we have a problem'
})

const errorMessage = computed(() => {
  if (props.error.statusCode === 404) return t('common.errors.not_found')
  if (props.error.statusCode === 403) return t('common.errors.forbidden')
  if (props.error.statusCode === 401) return t('common.errors.unauthorized')
  
  // Custom message if passed
  if (props.error.message && props.error.message !== 'FetchError') {
      return props.error.message
  }

  return t('common.errors.server')
})

const handleError = () => clearError({ redirect: '/' })
</script>

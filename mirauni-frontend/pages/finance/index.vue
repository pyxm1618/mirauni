<template>
  <div class="container mx-auto px-4 py-12">
    <!-- Hero Section -->
    <header class="mb-24 pt-10">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Left: Text Content -->
        <div class="text-left">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 bg-indie-secondary border-2 border-indie-border px-4 py-1 text-sm font-bold mb-8 shadow-brutal transform -rotate-1">
            <UIcon name="i-heroicons-currency-dollar-solid" class="w-5 h-5" />
            <span>Capital & Incubation</span>
          </div>

          <h1 class="text-5xl md:text-7xl font-display font-black mb-8 leading-tight">
            {{ $t('finance.hero.title') }}
            <br/>
            <span class="text-indie-primary text-transparent bg-clip-text" style="-webkit-text-stroke: 2px #000;">
              {{ $t('finance.hero.highlight') }}
            </span>
          </h1>
          
          <p class="text-xl text-indie-text font-bold font-mono mb-10 leading-relaxed border-l-4 border-indie-primary pl-6">
            {{ $t('finance.hero.subtitle') }}
          </p>

          <div class="flex flex-col sm:flex-row gap-6">
            <button @click="showInvestorModal" class="px-8 py-4 bg-black text-white border-2 border-indie-border shadow-brutal hover:bg-indie-secondary hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all font-bold text-lg uppercase tracking-wide">
              {{ $t('finance.hero.investorBtn') }}
            </button>
            <button @click="showFounderModal" class="px-8 py-4 bg-white border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-brutal-active transition-all font-bold text-lg uppercase tracking-wide">
              {{ $t('finance.hero.founderBtn') }}
            </button>
          </div>
        </div>

        <!-- Right: Decorative Visual (Abstract CSS Composition) -->
        <div class="hidden lg:block relative h-[400px]">
           <!-- Background blobi -->
           <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indie-primary/30 rounded-full blur-[80px]"></div>
           
           <!-- Stacked Cards Visual -->
           <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-white border-4 border-black rotate-6 shadow-brutal z-10 flex flex-col items-center justify-center p-6">
              <UIcon name="i-heroicons-arrow-trending-up-solid" class="w-20 h-20 mb-4 text-black" />
              <div class="font-black text-2xl uppercase">Growth</div>
              <div class="w-full h-2 bg-gray-200 mt-4 rounded-full overflow-hidden">
                <div class="w-3/4 h-full bg-indie-success"></div>
              </div>
           </div>
           
           <div class="absolute top-1/2 left-1/2 -translate-x-[60%] -translate-y-[40%] w-64 h-80 bg-indie-secondary border-4 border-black -rotate-6 shadow-brutal z-0 flex flex-col items-center justify-center p-6">
              <UIcon name="i-heroicons-banknotes-solid" class="w-20 h-20 mb-4 text-black" />
              <div class="font-black text-2xl uppercase">Capital</div>
           </div>

            <!-- Floater -->
            <div class="absolute bottom-10 right-10 bg-white border-2 border-black px-4 py-2 shadow-brutal font-mono text-sm font-bold rotate-12">
              +30% Profit Share
            </div>
            <div class="absolute top-10 left-0 bg-indie-accent border-2 border-black px-4 py-2 shadow-brutal font-mono text-sm font-bold -rotate-12 text-white">
              Web3 Grants
            </div>
        </div>
      </div>
    </header>

    <!-- Ecosystem Section (Redesigned: Alternating Rows) -->
    <section class="mb-32">
      <div class="space-y-24">
        
        <!-- Investor Row -->
        <div class="flex flex-col md:flex-row gap-12 items-center">
          <div class="w-full md:w-1/2 order-2 md:order-1">
             <div class="bg-black text-white p-8 md:p-12 border-2 border-indie-border shadow-brutal relative group">
                <!-- Decorative Elements -->
                <div class="absolute -top-4 -left-4 w-12 h-12 bg-indie-secondary border-2 border-black flex items-center justify-center text-xl shadow-brutal z-10">
                  <UIcon name="i-heroicons-briefcase-solid" class="w-6 h-6 text-black" />
                </div>
                
                <h3 class="text-3xl font-black mb-6 font-display uppercase tracking-wider text-indie-secondary">{{ $t('finance.investor.title') }}</h3>
                <p class="text-gray-400 mb-8 font-mono text-lg leading-relaxed">{{ $t('finance.investor.desc') }}</p>
                
                <div class="grid grid-cols-1 gap-4 mb-10 pl-4 border-l-2 border-gray-700">
                  <div v-for="(item, index) in investorBenefits" :key="index" class="flex items-center gap-3">
                     <div class="w-2 h-2 bg-indie-success rounded-full"></div>
                     <span class="font-bold text-gray-200">{{ $t(item) }}</span>
                  </div>
                </div>

                <button @click="showInvestorModal" class="w-full py-4 bg-white text-black font-black text-lg border-2 border-transparent hover:bg-indie-secondary hover:border-black transition-all uppercase tracking-widest group-hover:shadow-[4px_4px_0px_0px_#ffffff]">
                  {{ $t('finance.investor.action') }}
                </button>
             </div>
          </div>
          <div class="w-full md:w-1/2 order-1 md:order-2 flex justify-center">
             <!-- Abstract Visual: The Safe -->
             <div class="relative w-64 h-64 bg-indie-bg border-4 border-black shadow-brutal flex items-center justify-center p-4">
                <img src="/images/investor-illustration.png" alt="Investor Safe" class="w-full h-full object-contain filter drop-shadow-md" />
                <div class="absolute -bottom-6 -right-6 bg-indie-accent text-white font-bold px-4 py-2 border-2 border-black shadow-brutal -rotate-6">
                   VIP Access
                </div>
             </div>
          </div>
        </div>

        <!-- Founder Row -->
        <div class="flex flex-col md:flex-row gap-12 items-center">
          <div class="w-full md:w-1/2 flex justify-center order-1">
             <!-- Abstract Visual: The Rocket Blueprint -->
             <div class="relative w-72 h-80 bg-indie-primary border-4 border-black shadow-brutal p-4 transform -rotate-2">
                <div class="w-full h-full border-2 border-dashed border-black bg-white flex items-center justify-center overflow-hidden">
                   <img src="/images/founder-illustration.png" alt="Founder Blueprint" class="w-full h-full object-cover" />
                </div>
                <div class="absolute -top-6 -left-6 bg-white text-black font-bold px-6 py-3 border-2 border-black shadow-brutal rotate-3 whitespace-nowrap">
                   Start Building
                </div>
             </div>
          </div>
          <div class="w-full md:w-1/2 order-2">
             <div class="bg-white p-8 md:p-12 border-2 border-indie-border shadow-brutal relative">
                <div class="absolute -top-4 -right-4 w-12 h-12 bg-indie-primary border-2 border-black flex items-center justify-center text-xl shadow-brutal z-10">
                  <UIcon name="i-heroicons-user-group-solid" class="w-6 h-6 text-black" />
                </div>

                <h3 class="text-3xl font-black mb-6 font-display uppercase tracking-wider">{{ $t('finance.founder.title') }}</h3>
                <p class="text-gray-600 mb-8 font-mono text-lg leading-relaxed">{{ $t('finance.founder.desc') }}</p>
                
                <div class="space-y-3 mb-10">
                  <div v-for="(item, index) in founderBenefits" :key="index" class="flex items-start gap-3 p-3 bg-indie-bg border border-indie-border hover:translate-x-1 transition-transform cursor-default">
                     <span class="text-indie-accent font-bold">#{{ index + 1 }}</span>
                     <span class="font-bold text-gray-800">{{ $t(item) }}</span>
                  </div>
                </div>

                <button @click="showFounderModal" class="w-full py-4 bg-indie-primary text-black font-black text-lg border-2 border-black shadow-brutal hover:bg-indie-secondary hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase tracking-widest">
                  {{ $t('finance.founder.action') }}
                </button>
             </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Funding Models -->
    <section class="mb-32">
      <div class="flex items-center gap-4 mb-16 justify-center">
         <div class="h-1 w-12 bg-black"></div>
         <h2 class="text-4xl font-black text-center font-display uppercase tracking-tight">
           Funding <span class="text-indie-secondary">Models</span>
         </h2>
         <div class="h-1 w-12 bg-black"></div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Model 1 -->
        <div class="group relative bg-white border-2 border-black h-full shadow-brutal hover:-translate-y-2 transition-transform">
          <div class="bg-indie-bg p-4 border-b-2 border-black flex justify-between items-center">
             <span class="font-mono font-bold text-sm">#EQUITY</span>
             <div class="w-3 h-3 bg-red-500 rounded-full border border-black"></div>
          </div>
          <div class="p-8">
            <UIcon name="i-heroicons-chart-pie-solid" class="w-16 h-16 mb-6 text-gray-400 group-hover:text-black transition-all" />
            <h3 class="text-2xl font-black mb-4 group-hover:text-indie-accent transition-colors">{{ $t('finance.models.equity.title') }}</h3>
            <p class="text-gray-600 font-mono text-sm leading-relaxed">{{ $t('finance.models.equity.desc') }}</p>
          </div>
          <div class="absolute bottom-4 right-4 text-xs font-bold bg-black text-white px-2 py-1 transform rotate-3">
             Seed - Series A
          </div>
        </div>
        
        <!-- Model 2 -->
        <div class="group relative bg-white border-2 border-black h-full shadow-brutal hover:-translate-y-2 transition-transform">
           <div class="bg-indie-bg p-4 border-b-2 border-black flex justify-between items-center">
             <span class="font-mono font-bold text-sm">#RBF</span>
             <div class="w-3 h-3 bg-yellow-400 rounded-full border border-black"></div>
          </div>
          <div class="p-8">
            <UIcon name="i-heroicons-banknotes-solid" class="w-16 h-16 mb-6 text-gray-400 group-hover:text-black transition-all" />
            <h3 class="text-2xl font-black mb-4 group-hover:text-indie-success transition-colors">{{ $t('finance.models.rbf.title') }}</h3>
            <p class="text-gray-600 font-mono text-sm leading-relaxed">{{ $t('finance.models.rbf.desc') }}</p>
          </div>
          <div class="absolute bottom-4 right-4 text-xs font-bold bg-black text-white px-2 py-1 transform -rotate-2">
             Revenue Share
          </div>
        </div>

        <!-- Model 3 -->
        <div class="group relative bg-white border-2 border-black h-full shadow-brutal hover:-translate-y-2 transition-transform">
           <div class="bg-indie-bg p-4 border-b-2 border-black flex justify-between items-center">
             <span class="font-mono font-bold text-sm">#GRANTS</span>
             <div class="w-3 h-3 bg-green-500 rounded-full border border-black"></div>
          </div>
          <div class="p-8">
            <UIcon name="i-heroicons-globe-alt-solid" class="w-16 h-16 mb-6 text-gray-400 group-hover:text-black transition-all" />
            <h3 class="text-2xl font-black mb-4 group-hover:text-indie-secondary transition-colors">{{ $t('finance.models.grant.title') }}</h3>
            <p class="text-gray-600 font-mono text-sm leading-relaxed">{{ $t('finance.models.grant.desc') }}</p>
          </div>
           <div class="absolute bottom-4 right-4 text-xs font-bold bg-black text-white px-2 py-1 transform rotate-2">
             Non-Dilutive
          </div>
        </div>
      </div>
    </section>

    <!-- Growth Plan -->
    <section class="mb-24 relative">
       <!-- Container Frame -->
      <div class="border-4 border-black bg-indie-primary p-2 shadow-brutal">
        <div class="border-2 border-dashed border-black p-12 md:p-24 text-center relative overflow-hidden">
            <!-- Background Text Pattern -->
            <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none select-none overflow-hidden flex flex-wrap gap-8 p-4 transform -rotate-12 scale-150">
               <span v-for="i in 20" :key="i" class="text-4xl font-black uppercase text-black">Growth</span>
            </div>

            <h2 class="text-4xl md:text-6xl font-black mb-12 font-display relative z-10">
              {{ $t('finance.growth.title') }}
            </h2>
            
            <div class="relative inline-block mb-10 z-10">
               <div class="text-8xl md:text-9xl font-black text-white text-shadow-lg" style="text-shadow: 6px 6px 0px #000;">
                 30%
               </div>
               <div class="absolute -top-6 -right-12 bg-indie-accent text-white font-bold px-4 py-1 border-2 border-black shadow-brutal rotate-12 text-lg">
                 Commitment
               </div>
            </div>

            <p class="text-xl md:text-2xl font-bold max-w-3xl mx-auto uppercase tracking-wide leading-normal bg-white border-2 border-black p-6 shadow-brutal transform -rotate-1 relative z-10">
              {{ $t('finance.growth.subtitle') }}
            </p>
        </div>
      </div>
    </section>

    <!-- Legal -->
    <section class="py-8 border-t-2 border-dashed border-gray-300">
      <div class="container mx-auto px-4 max-w-4xl text-sm text-gray-500 font-mono">
        <h4 class="font-bold text-gray-900 mb-4 uppercase">{{ $t('finance.legal.title') }}</h4>
        <p class="mb-2">{{ $t('finance.legal.p1') }}</p>
        <p class="mb-2">{{ $t('finance.legal.p2') }}</p>
        <p>{{ $t('finance.legal.disclaimer') }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Features Lists Keys
const investorBenefits = [
  'finance.investor.f1',
  'finance.investor.f2',
  'finance.investor.f3',
  'finance.investor.f4',
  'finance.investor.f5',
]

const founderBenefits = [
  'finance.founder.f1',
  'finance.founder.f2',
  'finance.founder.f3',
  'finance.founder.f4',
  'finance.founder.f5',
]

// Modal Interaction
const showInvestorModal = () => {
  if (process.client) {
    alert(t('finance.modal.investor'))
  }
}

const showFounderModal = () => {
  if (process.client) {
    alert(t('finance.modal.founder'))
  }
}

useHead({
  title: t('finance.seo.title'),
  meta: [
    { name: 'description', content: t('finance.seo.desc') }
  ]
})
</script>

<style scoped>
/* Custom utility for brutalist shadow if not in tailwind config */
.shadow-brutal {
  box-shadow: 4px 4px 0px 0px #000000;
}
.shadow-brutal-hover {
  box-shadow: 6px 6px 0px 0px #000000;
}
.shadow-brutal-active {
  box-shadow: 0px 0px 0px 0px #000000;
}
</style>

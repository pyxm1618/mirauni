<template>
  <div class="min-h-screen bg-gray-100 p-8 space-y-12">
    <div class="max-w-4xl mx-auto text-center mb-8">
        <h1 class="text-4xl font-black mb-2">UI Prototypes Preview</h1>
        <p class="text-gray-500">Compare the 3 proposed designs for the Money Vault card.</p>
        <UButton to="/dashboard" color="black" variant="ghost" class="mt-4">Back to Dashboard</UButton>
    </div>

    <!-- Proto 1 -->
    <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-4">
            <h2 class="text-2xl font-bold bg-black text-white px-3 py-1 -rotate-1">Option 1: Classic Enhanced</h2>
            <span class="text-gray-500 text-sm">保留原汁原味，增加右上角独立操作区</span>
        </div>
        <!-- <Proto1 /> -->
    </div>

    <!-- Proto 2 -->
    <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-4">
             <h2 class="text-2xl font-bold bg-yellow-400 text-black px-3 py-1 rotate-1 border-2 border-black">Option 2: The Passbook</h2>
             <span class="text-gray-500 text-sm">票据/存折风格，左右分栏，操作最直观 (推荐)</span>
        </div>
        <!-- <Proto2 /> -->
    </div>

    <!-- Proto 3 -->
    <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-4">
             <h2 class="text-2xl font-bold bg-white text-black px-3 py-1 border-2 border-black">Option 3: The Console</h2>
             <span class="text-gray-500 text-sm">控制台风格，屏幕与操作区分离</span>
        </div>
        <!-- <Proto3 /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
// import Proto1 from '../123/proto_1_classic.vue'
// import Proto2 from '../123/proto_2_passbook.vue'
// import Proto3 from '../123/proto_3_console.vue'

definePageMeta({
    layout: 'blank'
})
</script>
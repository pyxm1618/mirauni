<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white border-2 border-indie-border shadow-brutal-lg p-8">
      <h1 class="text-3xl font-display font-bold mb-6 text-center">登录 / 注册</h1>
      
      <!-- 手机号登录 -->
      <div v-if="!showCodeInput" class="space-y-4">
        <div>
          <label class="block text-sm font-bold mb-2">手机号</label>
          <input 
            v-model="phone"
            type="tel" 
            placeholder="请输入手机号"
            class="w-full px-4 py-3 border-2 border-indie-border text-lg"
            maxlength="11"
          />
        </div>
        <button 
          @click="sendCode"
          class="w-full px-6 py-3 bg-indie-primary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold"
        >
          获取验证码
        </button>
      </div>

      <!-- 验证码输入 -->
      <div v-else class="space-y-4">
        <div>
          <label class="block text-sm font-bold mb-2">验证码</label>
          <input 
            v-model="code"
            type="text" 
            placeholder="请输入6位验证码"
            class="w-full px-4 py-3 border-2 border-indie-border text-lg text-center tracking-widest"
            maxlength="6"
          />
          <p class="text-sm text-gray-500 mt-2">验证码已发送至 {{ phone }}</p>
        </div>
        <button 
          @click="login"
          class="w-full px-6 py-3 bg-indie-primary border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold"
        >
          登录
        </button>
        <button 
          @click="showCodeInput = false"
          class="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          返回修改手机号
        </button>
      </div>

      <!-- 分隔线 -->
      <div class="flex items-center gap-4 my-6">
        <div class="flex-1 h-px bg-gray-300"></div>
        <span class="text-gray-400 text-sm">或</span>
        <div class="flex-1 h-px bg-gray-300"></div>
      </div>

      <!-- 微信登录 -->
      <button class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#07C160] text-white border-2 border-indie-border shadow-brutal hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.133 0 .241-.108.241-.245 0-.06-.024-.12-.04-.177l-.325-1.233a.49.49 0 0 1 .178-.553c1.526-1.122 2.509-2.783 2.509-4.62 0-3.371-3.065-6.124-7.07-6.124zm-2.5 3.39c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.543.434-.982.97-.982zm5.002 0c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.543.434-.982.97-.982z"/>
        </svg>
        微信登录
      </button>

      <!-- 协议 -->
      <p class="text-xs text-gray-400 text-center mt-6">
        登录即表示同意
        <a href="#" class="text-indie-text underline">用户协议</a>
        和
        <a href="#" class="text-indie-text underline">隐私政策</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const phone = ref('')
const code = ref('')
const showCodeInput = ref(false)

function sendCode() {
  // TODO: 调用发送验证码 API
  if (phone.value.length === 11) {
    showCodeInput.value = true
  }
}

function login() {
  // TODO: 调用登录 API
  console.log('Login with:', phone.value, code.value)
}

useSeoMeta({
  title: '登录 - 小概率',
  robots: 'noindex'
})
</script>

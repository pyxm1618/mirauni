// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  devServer: {
    port: 3001 // 固定端口，用于 SSO
  },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/i18n'
  ],
  i18n: {
    locales: [
      { code: 'zh', name: '中文', file: 'zh-CN.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'zh',
    lazy: true,
    langDir: 'locales',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'zh'
    }
  },
  supabase: {
    redirect: false, // We handle redirection manually in middleware
    cookieOptions: {
      domain: process.env.NODE_ENV === 'production' ? '.mirauni.com' : undefined,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    }
  },
  runtimeConfig: {
    wechatAppId: '', // NUXT_WECHAT_APP_ID
    wechatAppSecret: '', // NUXT_WECHAT_APP_SECRET
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    }
  },
  ui: {
    global: true,
  },
  app: {
    head: {
      title: '钱途 - Money Path',
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap' }
      ]
    }
  },
  colorMode: {
    preference: 'light' // Force light mode for now as per design generally being bright
  }
})

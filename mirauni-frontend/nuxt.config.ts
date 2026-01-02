// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  ssr: true,
  devtools: { enabled: true },
  devServer: {
    port: 3000 // 固定端口，用于 SSO
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
    redirect: false,
    cookieOptions: {
      domain: process.env.NODE_ENV === 'production' ? '.mirauni.com' : undefined,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    }
  },

  runtimeConfig: {
    // 腾讯云短信配置（仅服务端可用）
    tencentSecretId: process.env.TENCENT_SECRET_ID,
    tencentSecretKey: process.env.TENCENT_SECRET_KEY,
    tencentSmsSdkAppId: process.env.TENCENT_SMS_SDK_APP_ID,
    tencentSmsSignName: process.env.TENCENT_SMS_SIGN_NAME,
    tencentSmsTemplateId: process.env.TENCENT_SMS_TEMPLATE_ID,

    // 微信开放平台配置（仅服务端可用）
    wechatAppId: process.env.WECHAT_APP_ID,
    wechatAppSecret: process.env.WECHAT_APP_SECRET,
    wechatMchId: process.env.WECHAT_MCH_ID,
    wechatApiKey: process.env.WECHAT_API_KEY,

    // 百度推送令牌（仅服务端可用）
    baiduPushToken: process.env.BAIDU_PUSH_TOKEN,

    // 公开配置（客户端可用）
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://mirauni.com',
      baiduAnalyticsId: process.env.NUXT_PUBLIC_BAIDU_ANALYTICS_ID || ''
    }
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '小概率 - 独立开发者找合伙人的第一站',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '帮助独立开发者发布项目、寻找技术合伙人，找到靠谱的创业伙伴' },
        { name: 'keywords', content: '独立开发者,技术合伙人,找合伙人,创业项目,程序员副业' },
        { name: 'author', content: '小概率' },
        { property: 'og:site_name', content: '小概率' },
        { property: 'og:locale', content: 'zh_CN' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: '小概率 - 独立开发者找合伙人的第一站' },
        { property: 'og:description', content: '帮助独立开发者发布项目、寻找技术合伙人，找到靠谱的创业伙伴' },
        { name: 'robots', content: 'index,follow' }
      ],
      link: [
        { rel: 'canonical', href: 'https://mirauni.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap' }
      ]
    }
  },

  routeRules: {
    '/': { swr: 3600 },
    '/projects': { swr: 600 },
    '/projects/**': { swr: 3600 },
    '/developers': { swr: 600 },
    '/developers/**': { swr: 3600 },
    '/academy': { swr: 3600 },
    '/academy/**': { swr: 86400 },
    // 管理后台 API CORS 配置
    '/api/admin/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': 'https://admin.mirauni.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      }
    }
  }
})

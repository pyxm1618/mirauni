// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  ssr: true,
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/supabase'
  ],

  supabase: {
    redirect: false
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
    '/academy/**': { swr: 86400 }
  }
})

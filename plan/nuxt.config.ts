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
  ],
  supabase: {
    redirect: false, // We handle redirection manually in middleware
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

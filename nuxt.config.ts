import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from "@tailwindcss/vite";

const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

const appName = isDev ? 'Zync - Development' : 'Zync'

export default defineNuxtConfig({
  compatibilityDate: "2025-09-22",
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt'
  ],
  nitro: {
    experimental: {
      wasm: true
    }
  },
  typescript: {
    typeCheck: false
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  css: [
    "@/assets/css/main.css",
  ],
  app: {
    head: {
      title: appName,
      titleTemplate: `%s | ${appName}`,
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#000000' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Zync' },
        { name: 'mobile-web-app-capable', content: 'yes' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/chatOne.ico' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icons/icon-192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/icons/icon-512.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-touch-icon-57x57.png' },
        { rel: 'apple-touch-icon', sizes: '60x60', href: '/apple-touch-icon-60x60.png' },
        { rel: 'apple-touch-icon', sizes: '72x72', href: '/apple-touch-icon-72x72.png' },
        { rel: 'apple-touch-icon', sizes: '76x76', href: '/apple-touch-icon-76x76.png' },
        { rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-touch-icon-114x114.png' },
        { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-touch-icon-120x120.png' },
        { rel: 'apple-touch-icon', sizes: '144x144', href: '/apple-touch-icon-144x144.png' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-touch-icon-152x152.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon-180x180.png' },
        { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon-precomposed.png' },
        { rel: 'apple-touch-icon-precomposed', sizes: '57x57', href: '/apple-touch-icon-57x57-precomposed.png' },
        { rel: 'apple-touch-icon-precomposed', sizes: '60x60', href: '/apple-touch-icon-60x60-precomposed.png' },
        { rel: 'apple-touch-icon-precomposed', sizes: '72x72', href: '/apple-touch-icon-72x72-precomposed.png' },
        { rel: 'apple-touch-icon-precomposed', sizes: '76x76', href: '/apple-touch-icon-76x76-precomposed.png' },
        { rel: 'apple-touch-icon-precomposed', sizes: '114x114', href: '/apple-touch-icon-114x114-precomposed.png' },
        { rel: 'apple-touch-icon-precomposed', sizes: '120x120', href: '/apple-touch-icon-120x120-precomposed.png' },
        { rel: 'apple-touch-icon-precomposed', sizes: '144x144', href: '/apple-touch-icon-144x144-precomposed.png' },
        { rel: 'apple-touch-icon-precomposed', sizes: '152x152', href: '/apple-touch-icon-152x152-precomposed.png' },
        { rel: 'apple-touch-icon-precomposed', sizes: '180x180', href: '/apple-touch-icon-180x180-precomposed.png' },
        { rel: 'manifest', href: '/manifest.json' },
      ]
    }
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
    mongodbDbName: process.env.MONGODB_DB_NAME || 'zync',
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    },
  },
})

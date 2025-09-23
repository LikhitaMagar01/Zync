import tailwindcss from "@tailwindcss/vite";

const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

const appName = isDev ? 'Zync - Development' : 'Zync'

export default defineNuxtConfig({
  compatibilityDate: "2025-09-22",
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt'
  ],
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
      link: [
        { rel: 'icon', type: 'image/png', href: '/chatOne.ico' },
      ]
    }
  }
})

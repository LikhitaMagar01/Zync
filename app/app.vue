<template>
  <div>
    <SplashScreen v-if="showSplash" />
    <div v-show="!showSplash">
      <NuxtLayout :name="layoutName">
        <NuxtPage />
      </NuxtLayout>
    </div>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, navigateTo } from 'nuxt/app'
import SplashScreen from './components/SplashScreen.vue'
import ToastContainer from './components/core/ToastContainer.vue'
import { useAuthStore } from './stores/auth'

const showSplash = ref(true)
const route = useRoute()
const authStore = useAuthStore()

const layoutName = computed(() => {
  const authRoutes = ['/', '/signin', '/signup']
  return authRoutes.includes(route.path) ? 'custom' : 'default'
})

watch(() => route.path, async (newPath) => {
  if (showSplash.value) return
    
  const authRoutes = ['/', '/signin', '/signup']
  const isAuthRoute = authRoutes.includes(newPath)
  const isProtectedRoute = newPath === '/home'
  
  if (authStore.isAuthenticated && isAuthRoute) {
    await navigateTo('/home')
  } 
  else if (!authStore.isAuthenticated && isProtectedRoute) {
    await navigateTo('/signin')
  }
})

watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (showSplash.value) return
    
  const authRoutes = ['/', '/signin', '/signup']
  
  if (isAuthenticated && authRoutes.includes(route.path)) {
    await navigateTo('/home')
  } else if (!isAuthenticated && route.path === '/home') {
    await navigateTo('/signin')
  }
})

onMounted(async () => {
  await authStore.checkAuthStatus()
  const authRoutes = ['/', '/signin', '/signup']
  if (authStore.isAuthenticated && authRoutes.includes(route.path)) {
    await navigateTo('/home')
  } else if (!authStore.isAuthenticated && route.path === '/home') {
    await navigateTo('/signin')
  }
  
  setTimeout(() => {
    showSplash.value = false
  }, 3800)
})
</script>

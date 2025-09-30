<script setup lang="ts">
import { useHead, navigateTo } from 'nuxt/app'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

useHead({
    title: 'Home'
})

const logout = () => {
    authStore.logout()
    navigateTo('/signin')
}
</script>

<template>
    <div class="min-h-screen bg-black flex items-center justify-center">
        <div class="text-center text-white px-4">
            <h1 class="text-4xl sm:text-6xl font-bold mb-4">Welcome to Zync!</h1>
            <p class="text-gray-300 mb-8">This is home</p>
            <button @click="logout"
                class="w-full max-w-xs py-3 sm:py-4 text-white border border-black rounded-lg sm:rounded-xl font-bold bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none relative text-sm sm:text-base">
                Logout
            </button>
        </div>
    </div>
</template>

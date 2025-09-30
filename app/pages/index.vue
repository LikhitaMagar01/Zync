<script setup lang="ts">
import { onMounted } from 'vue'
import { useHead, navigateTo } from 'nuxt/app'
import { useAuthStore } from '../stores/auth'
import SigninForm from '../components/sign-in/SIgninForm.vue'

const authStore = useAuthStore()

useHead({
    title: 'Home'
})

onMounted(async () => {
    await authStore.checkAuthStatus()
    if (authStore.isAuthenticated) {
        await navigateTo('/home')
    }
})
</script>

<template>
    <div v-if="!authStore.isAuthenticated">
        <SigninForm />
    </div>
    <div v-else class="min-h-screen bg-black flex items-center justify-center">
        <div class="text-white text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Redirecting to home...</p>
        </div>
    </div>
</template>

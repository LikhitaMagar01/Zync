<script setup lang="ts">
import SideNav from '../components/navigation/SideNav.vue'
import BottomNav from '../components/navigation/BottomNav.vue'
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <SideNav />
        <main class="pb-20 md:pb-0 md:ml-64">
            <slot />
        </main>
        <BottomNav />
    </div>
</template>

<script setup lang="ts">
import Signup from '@/components/sign-up/signup.vue'

useHead({
    title: 'Home'
})

definePageMeta({
    layout: false
})
</script>

<template>
    <Signup />
</template>

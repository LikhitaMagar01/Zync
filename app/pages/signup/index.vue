<script setup lang="ts">
import { useHead } from 'nuxt/app';
import Signup from '../../components/sign-up/signup.vue';

useHead({
    title: 'Sign Up'
})

definePageMeta({
    layout: 'default'
})
</script>

<template>
    <Signup />
</template>

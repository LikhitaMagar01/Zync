<script setup lang="ts">
import { useHead } from 'nuxt/app';
import SignupForm from '../../components/sign-up/SignupForm.vue';

useHead({
    title: 'Sign Up'
})
</script>

<template>
    <SignupForm />
</template>

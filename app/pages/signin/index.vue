<script setup lang="ts">
import { useHead } from 'nuxt/app';
import SigninForm from '../../components/sign-in/SIgninForm.vue';

useHead({
    title: 'Sign In'
})
</script>

<template>
    <SigninForm />
</template>

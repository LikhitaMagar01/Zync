<script setup lang="ts">
import { useSignupStore } from '../../stores/signup'
import { useHead } from 'nuxt/app';

const signupStore = useSignupStore()
useHead({
    title: 'Sign Up'
})

</script>

<template>
    <div>
        {{ signupStore.name }}
    </div>
</template>

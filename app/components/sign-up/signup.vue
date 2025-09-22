<script setup lang="ts">
import { useSignupStore } from '@/stores/signup'
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

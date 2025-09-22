<script setup lang="ts">
import MainHeader from '@/components/core/MainHeader.vue'
import MainFooter from '@/components/core/MainFooter.vue'

</script>

<template>
    <div>
        <MainHeader />
        <main>
            <slot />
        </main>
        <MainFooter />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Icon from '../core/Icon.vue'

const route = useRoute()
const isVisible = ref(true)
const lastScrollY = ref(0)
const scrollThreshold = 10 // Minimum scroll distance to trigger hide/show

const isActive = (path) => {
    return route.path === path
}

const handleScroll = () => {
    const currentScrollY = window.scrollY
    // Don't hide if we're at the top of the page
    if (currentScrollY < 50) {
        isVisible.value = true
        lastScrollY.value = currentScrollY
        return
    }

    // Calculate scroll direction
    const scrollDifference = Math.abs(currentScrollY - lastScrollY.value)

    // Only trigger if scroll difference is significant enough
    if (scrollDifference > scrollThreshold) {
        if (currentScrollY > lastScrollY.value) {
            // Scrolling down - hide navbar
            isVisible.value = false
        } else {
            // Scrolling up - show navbar
            isVisible.value = true
        }

        lastScrollY.value = currentScrollY
    }
}

onMounted(() => {
    // Only add scroll listener on mobile
    if (window.innerWidth < 768) {
        window.addEventListener('scroll', handleScroll, { passive: true })
    }
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
    <nav class="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50 md:hidden transition-transform duration-300 ease-in-out"
        :class="isVisible ? 'translate-y-0' : 'translate-y-full'">
        <div class="flex justify-around items-center py-2">
            <NuxtLink to="/home" class="flex flex-col items-center py-2 px-4 rounded-lg transition-colors"
                :class="isActive('/home') ? 'text-white' : 'hover:bg-gray-800 text-gray-400'">
                <Icon iconName="home" :size="24" class="mb-1"
                    :svgFill="isActive('/home') ? 'text-white' : 'text-gray-400'" />
                <span class="text-xs font-medium">Home</span>
            </NuxtLink>
            <NuxtLink to="/chat" class="flex flex-col items-center py-2 px-4 rounded-lg transition-colors"
                :class="isActive('/chat') ? 'text-white' : 'hover:bg-gray-800 text-gray-400'">
                <Icon iconName="chat" :size="24" class="mb-1"
                    :svgFill="isActive('/chat') ? 'text-white' : 'text-gray-400'" />
                <span class="text-xs font-medium">Chat</span>
            </NuxtLink>
            <NuxtLink to="/profile" class="flex flex-col items-center py-2 px-4 rounded-lg transition-colors"
                :class="isActive('/profile') ? 'text-white' : 'hover:bg-gray-800 text-gray-400'">
                <Icon iconName="profile" :size="24" class="mb-1"
                    :svgFill="isActive('/profile') ? 'text-white' : 'text-gray-400'" />
                <span class="text-xs font-medium">Profile</span>
            </NuxtLink>
        </div>
    </nav>
</template>

<script setup>
import Icon from '../core/Icon.vue'

const route = useRoute()

const isActive = (path) => {
  return route.path === path
}
</script>

<template>
  <nav
    class="hidden md:flex md:flex-col md:w-64 md:h-screen md:bg-black md:border-r md:border-gray-800 md:fixed md:left-0 md:top-0 md:z-40">
    <div class="flex flex-col h-full">
      <div class="p-6 border-b border-gray-800">
        <h1 class="text-xl font-bold text-white">Zync</h1>
      </div>
      <div class="flex-1 py-4">
        <div class="space-y-2 px-4">
          <NuxtLink to="/home" class="flex items-center px-4 py-3 rounded-lg transition-colors"
            :class="isActive('/home') ? 'bg-gray-800 text-white border-r-2 border-white' : 'text-gray-400 hover:bg-gray-800'">
            <Icon iconName="home" :size="20" class="mr-3"
              :svgFill="isActive('/home') ? 'text-white' : 'text-gray-400'" />
            <span class="font-medium">Home</span>
          </NuxtLink>
          <NuxtLink to="/chat" class="flex items-center px-4 py-3 rounded-lg transition-colors"
            :class="isActive('/chat') ? 'bg-gray-800 text-white border-r-2 border-white' : 'text-gray-400 hover:bg-gray-800'">
            <Icon iconName="chat" :size="20" class="mr-3"
              :svgFill="isActive('/chat') ? 'text-white' : 'text-gray-400'" />
            <span class="font-medium">Chat</span>
          </NuxtLink>
          <NuxtLink to="/profile" class="flex items-center px-4 py-3 rounded-lg transition-colors"
            :class="isActive('/profile') ? 'bg-gray-800 text-white border-r-2 border-white' : 'text-gray-400 hover:bg-gray-800'">
            <Icon iconName="profile" :size="20" class="mr-3"
              :svgFill="isActive('/profile') ? 'text-white' : 'text-gray-400'" />
            <span class="font-medium">Profile</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

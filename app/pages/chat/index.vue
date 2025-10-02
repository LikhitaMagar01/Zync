<script setup lang="ts">
import { useHead } from 'nuxt/app'
import UserSearchBar from '../../components/UserSearchBar.vue'
import Icon from '../../components/core/Icon.vue'

useHead({
  title: 'Messages - Zync'
})

const handleUserSelected = (user: any) => {
  console.log('Selected user:', user)
  // TODO: Implement chat request creation
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div class="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Messages
            </h1>
            <p class="text-sm text-gray-500 mt-1">Connect with your friends</p>
          </div>
          <div class="flex items-center space-x-3">
            <button class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:scale-105">
              <Icon iconName="moreVertical" :size="20" svgFill="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="px-4 py-4">
      <div class="relative">
        <UserSearchBar 
          placeholder="Search users by username, name, or email..."
          @user-selected="handleUserSelected"
        />
      </div>
    </div>
    <div class="px-4 pb-4">
      <div class="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        <div class="text-center py-16 px-6">
          <div class="relative mb-8">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-60 animate-pulse"></div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-40 animate-pulse" style="animation-delay: 0.5s;"></div>
            </div>
            <div class="relative z-10 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Icon iconName="chat" :size="40" svgFill="text-white" />
            </div>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Start a Conversation</h2>
          <p class="text-gray-500 text-lg leading-relaxed max-w-sm mx-auto">
            Search for friends above to begin chatting and sharing moments together
          </p>
          <div class="mt-8 grid grid-cols-3 gap-4 max-w-xs mx-auto">
            <div class="text-center">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Icon iconName="users" :size="24" svgFill="text-blue-600" />
              </div>
              <p class="text-xs text-gray-600 font-medium">Find Friends</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Icon iconName="chat" :size="24" svgFill="text-purple-600" />
              </div>
              <p class="text-xs text-gray-600 font-medium">Chat</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Icon iconName="heart" :size="24" svgFill="text-green-600" />
              </div>
              <p class="text-xs text-gray-600 font-medium">Connect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fixed bottom-6 right-6 z-20">
      <button class="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center">
        <Icon iconName="add" :size="24" svgFill="text-white" />
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
<template>
  <div class="relative">
    <div class="flex items-center space-x-3">
      <div class="flex-1 relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          class="w-full px-6 py-2 pl-10 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 shadow-sm text-gray-900 placeholder-gray-500"
          @input="handleSearch"
          @focus="onFocus"
          @blur="onBlur"
        />
        <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Icon iconName="search" :size="20" svgFill="text-gray-400" class="transition-colors duration-200" />
        </div>
        <div class="absolute inset-y-0 right-0 pr-5 flex items-center">
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="p-1 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-110"
          >
            <Icon iconName="close" :size="16" svgFill="text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="showResults"
      class="absolute z-50 w-full mt-3 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl max-h-80 overflow-hidden"
    >
      <div v-if="isLoading" class="p-6 text-center">
        <div class="flex items-center justify-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <p class="text-sm text-gray-600 font-medium">Searching...</p>
        </div>
      </div>
      
      <div v-else-if="searchResults.length === 0" class="p-6 text-center">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Icon iconName="document" :size="24" svgFill="text-gray-400" />
        </div>
        <p class="text-sm text-gray-500 font-medium">No users found</p>
        <p class="text-xs text-gray-400 mt-1">Try a different search term</p>
      </div>
      
      <div v-else class="max-h-72 overflow-y-auto">
        <div
          v-for="(user, index) in searchResults"
          :key="user._id"
          @click="selectUser(user)"
          class="flex items-center space-x-4 p-4 hover:bg-gray-50/80 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 border-b border-gray-100/50 last:border-b-0"
          :class="{ 'bg-blue-50/30': index === 0 }"
        >
          <!-- Avatar with gradient background -->
          <div class="relative">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
              {{ getUserInitials(user) }}
            </div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          
          <!-- User Info -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">
              {{ getUserDisplayName(user) }}
            </p>
            <p class="text-sm text-gray-500 truncate">{{ user.username }}</p>
            <p v-if="user.bio" class="text-xs text-gray-400 truncate mt-1">{{ user.bio }}</p>
          </div>
          
          <!-- Action Button -->
          <div class="flex-shrink-0">
            <button class="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm">
              <Icon iconName="add" :size="16" svgFill="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from './core/Icon.vue'

interface Props {
  placeholder?: string
}

interface SearchResponse {
  success: boolean
  data?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search users by username, name, or email...'
})

const emit = defineEmits<{
  'user-selected': [user: any]
}>()

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isLoading = ref(false)
const showResults = ref(false)
const isFocused = ref(false)

const handleSearch = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    showResults.value = false
    return
  }
  
  isLoading.value = true
  try {
    const response = await $fetch<SearchResponse>('/api/users/search', {
      query: { q: searchQuery.value }
    })
    searchResults.value = response?.data || []
    showResults.value = true
  } catch (error) {
    console.error('Search users failed', error)
    searchResults.value = []
    showResults.value = false
  } finally {
    isLoading.value = false
  }
}

const selectUser = (user: any) => {
  emit('user-selected', user)
  clearSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  showResults.value = false
  searchResults.value = []
}

const onFocus = () => {
  isFocused.value = true
  if (searchQuery.value.length >= 2) {
    showResults.value = true
  }
}

const onBlur = () => {
  isFocused.value = false
  // Delay hiding results to allow for click events
  setTimeout(() => {
    if (!isFocused.value) {
      showResults.value = false
    }
  }, 150)
}

const getUserInitials = (user: any) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }
  return user.username?.[0]?.toUpperCase() || '?'
}

const getUserDisplayName = (user: any) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  return user.username || 'Unknown User'
}
</script>

<style scoped>
/* Custom scrollbar for search results */
.max-h-72::-webkit-scrollbar {
  width: 4px;
}

.max-h-72::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-72::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.max-h-72::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* Smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}
</style>


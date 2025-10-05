<template>
  <div class="relative">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        @input="handleSearch"
        @focus="onFocus"
        @blur="onBlur"
      />
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="p-1 rounded-full hover:bg-gray-700 transition-colors"
        >
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Search Results Dropdown -->
    <div
      v-if="showResults || searchResults.length > 0"
      class="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-80 overflow-hidden"
    >
      <div v-if="isLoading" class="p-4 text-center">
        <div class="flex items-center justify-center space-x-3">
          <div class="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          <p class="text-sm text-gray-400 font-medium">Searching...</p>
        </div>
      </div>
      
      <div v-else-if="searchResults.length === 0" class="p-4 text-center">
        <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <p class="text-sm text-gray-400 font-medium">No users found</p>
        <p class="text-xs text-gray-500 mt-1">Try a different search term</p>
      </div>
      
      <div v-else class="max-h-72 overflow-y-auto">
        <div
          v-for="(user, index) in searchResults"
          :key="user._id"
          @click.stop="selectUser(user)"
          class="flex items-center space-x-3 p-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
          :class="{ 'bg-gray-700': index === 0 }"
        >
          <!-- Avatar -->
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {{ getUserInitials(user) }}
          </div>
          
          <!-- User Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-medium text-white truncate">
                {{ getUserDisplayName(user) }}
              </p>
              <span v-if="user.isOnline" class="w-2 h-2 bg-green-500 rounded-full"></span>
              <span v-else class="w-2 h-2 bg-gray-500 rounded-full"></span>
            </div>
            <p class="text-sm text-gray-400 truncate">{{ user.username }}</p>
            <p v-if="user.bio" class="text-xs text-gray-500 truncate mt-1">{{ user.bio }}</p>
          </div>
          
          <!-- Action Button -->
          <div class="flex-shrink-0">
            <button class="w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  placeholder?: string
}

interface SearchResponse {
  success: boolean
  data?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search users...'
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.max-h-72::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
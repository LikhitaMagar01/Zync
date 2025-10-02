<template>
  <div class="flex-1 flex flex-col h-screen bg-black">
    <div v-if="selectedUser" class="bg-gray-900 border-b border-gray-800">
      <div class="px-6 py-4">
        <div class="flex items-center space-x-4">
          <button 
            @click="$emit('close-conversation')"
            class="lg:hidden p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {{ getUserInitials(selectedUser) }}
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-white">{{ getUserDisplayName(selectedUser) }}</h3>
            <p class="text-sm text-gray-400">{{ selectedUser.username }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto bg-black p-6">
      <div v-if="messages.length === 0 && selectedUser" class="h-full flex items-center justify-center">
        <div class="text-center max-w-md mx-auto">
          <div class="w-40 h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-5xl mx-auto mb-8 shadow-2xl">
            {{ getUserInitials(selectedUser) }}
          </div>
          <h3 class="text-3xl font-bold text-white mb-2">{{ getUserDisplayName(selectedUser) }}</h3>
          <p class="text-lg text-gray-400 mb-2">{{ selectedUser.username }}</p>
          <button class="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors mb-8 shadow-lg">
            View profile
          </button>
          <p class="text-gray-400 text-sm">Send a message to start the conversation</p>
        </div>
      </div>

      <div v-else-if="messages.length > 0" class="space-y-4">
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="message.isOwn ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-xs lg:max-w-md px-4 py-3 rounded-lg"
            :class="message.isOwn 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-800 text-white'"
          >
            <p class="text-sm">{{ message.content }}</p>
            <p 
              class="text-xs mt-1"
              :class="message.isOwn ? 'text-blue-100' : 'text-gray-400'"
            >
              {{ formatMessageTime(message.timestamp) }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedUser" class="bg-gray-900 border-t border-gray-800">
      <div class="p-4">
        <div class="flex items-center space-x-3">
          <button class="p-2 rounded-full hover:bg-gray-800 transition-colors">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
          <div class="flex-1 relative">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Message..."
              class="w-full px-4 py-3 pr-20 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              @keypress.enter="sendMessage"
            />
            <div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <button class="p-1 rounded-full hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
              </button>
              <button class="p-1 rounded-full hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </button>
              <button
                @click="sendMessage"
                :disabled="!newMessage.trim()"
                class="p-1 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 transition-colors"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!selectedUser" class="flex-1 flex items-center justify-center bg-black">
      <div class="text-center">
        <div class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-white mb-2">Your messages</h2>
        <p class="text-gray-400 mb-6">Send a message to start a chat.</p>
        <button class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
          Send message
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface User {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
}

interface Message {
  id: string
  content: string
  timestamp: Date
  isOwn: boolean
  senderId: string
}

interface Props {
  selectedUser?: User | null
  messages: Message[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close-conversation': []
  'send-message': [content: string, userId: string]
}>()

const newMessage = ref('')

const getUserInitials = (user: User) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }
  return user.username?.[0]?.toUpperCase() || '?'
}

const getUserDisplayName = (user: User) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  return user.username || 'Unknown User'
}

const formatMessageTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !props.selectedUser) return
  
  emit('send-message', newMessage.value.trim(), props.selectedUser._id)
  newMessage.value = ''
}
</script>

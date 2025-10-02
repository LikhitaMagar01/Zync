<template>
  <div class="hidden lg:flex lg:flex-col lg:w-80 lg:h-screen lg:bg-black lg:border-r lg:border-gray-800">
    <div class="p-4 border-b border-gray-800">
      <UserSearchBar 
        placeholder="Search"
        @user-selected="handleUserSelected"
      />
    </div>
    <div class="flex-1 overflow-y-auto">
      <div v-if="conversations.length === 0" class="p-6 text-center">
        <p class="text-gray-400 text-sm">No conversations yet</p>
        <p class="text-gray-500 text-xs mt-1">Start chatting with someone!</p>
      </div>

      <div v-else-if="conversations.length > 0" class="space-y-1 p-2">
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          @click="selectConversation(conversation)"
          class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
          :class="{ 'bg-gray-800': selectedConversation?.id === conversation.id }"
        >
          <!-- User Avatar -->
          <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {{ getUserInitials(conversation.user) }}
          </div>

          <!-- User Info -->
          <div class="flex-1 min-w-0">
            <p class="font-medium text-white truncate">
              {{ getUserDisplayName(conversation.user) }}
            </p>
            <p class="text-sm text-gray-400 truncate">
              {{ conversation.lastMessage || 'Start a conversation...' }}
            </p>
          </div>

          <!-- Time -->
          <div class="flex-shrink-0">
            <p class="text-xs text-gray-500">{{ formatTime(conversation.lastMessageTime) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserSearchBar from '../UserSearchBar.vue'

interface User {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
}

interface Conversation {
  id: string
  user: User
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
}

interface Props {
  conversations: Conversation[]
  selectedConversation?: Conversation | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'conversation-selected': [conversation: Conversation]
  'start-new-chat': []
  'user-selected': [user: User]
}>()

const selectConversation = (conversation: Conversation) => {
  emit('conversation-selected', conversation)
}

const handleUserSelected = (user: User) => {
  emit('user-selected', user)
}

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

const formatTime = (date?: Date) => {
  if (!date) return ''
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  
  return date.toLocaleDateString()
}
</script>

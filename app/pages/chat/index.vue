<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHead } from 'nuxt/app'
import UserSearchBar from '../../components/UserSearchBar.vue'
import ChatSidebar from '../../components/chat/ChatSidebar.vue'
import ConversationArea from '../../components/chat/ConversationArea.vue'
import Icon from '../../components/core/Icon.vue'

useHead({
  title: 'Messages - Zync'
})

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

interface Message {
  id: string
  content: string
  timestamp: Date
  isOwn: boolean
  senderId: string
}

const conversations = ref<Conversation[]>([])
const selectedConversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])
const showNewChat = ref(false)

const selectedUser = computed(() => selectedConversation.value?.user || null)

const handleUserSelected = (user: User) => {
  const existingConversation = conversations.value.find(conv => conv.user._id === user._id)
  
  if (existingConversation) {
    selectedConversation.value = existingConversation
  } else {
    const newConversation: Conversation = {
      id: `conv_${user._id}_${Date.now()}`,
      user,
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0
    }
    
    conversations.value.unshift(newConversation)
    selectedConversation.value = newConversation
  }
  
  showNewChat.value = false
}

const handleConversationSelected = (conversation: Conversation) => {
  selectedConversation.value = conversation
  messages.value = []
}

const handleStartNewChat = () => {
  showNewChat.value = true
  selectedConversation.value = null
}

const handleCloseConversation = () => {
  selectedConversation.value = null
}

const handleSendMessage = (content: string, userId: string) => {
  if (!content.trim()) return
  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    content,
    timestamp: new Date(),
    isOwn: true,
    senderId: userId
  }
  
  messages.value.push(newMessage)
  if (selectedConversation.value) {
    selectedConversation.value.lastMessage = content
    selectedConversation.value.lastMessageTime = new Date()
  }
}
</script>

<template>
  <div class="min-h-screen bg-black flex">
    <ChatSidebar 
      :conversations="conversations"
      :selected-conversation="selectedConversation"
      @conversation-selected="handleConversationSelected"
      @user-selected="handleUserSelected"
    />
    <ConversationArea
      :selected-user="selectedUser"
      :messages="messages"
      @close-conversation="handleCloseConversation"
      @send-message="handleSendMessage"
    />
  </div>
</template>
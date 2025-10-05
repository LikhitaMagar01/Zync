<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useHead } from 'nuxt/app'
import UserSearchBar from '../../components/UserSearchBar.vue'
import ChatSidebar from '../../components/chat/ChatSidebar.vue'
import ConversationArea from '../../components/chat/ConversationArea.vue'

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
  receiverId: string
}

const { useChat } = await import('../../composables/useSocket')
const { 
  isConnected, 
  connect,
  disconnect,
  onMessage, 
  offMessage,
  sendMessage: sendChatMessage
} = useChat()

const conversations = ref<Conversation[]>([])
const selectedConversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])
const currentUserId = ref('')
const currentUser = ref<User | null>(null)
const isAuthenticated = ref(false)

const messageStore = ref<Map<string, Message[]>>(new Map())

// User cache to avoid repeated API calls
const userCache = ref<Map<string, User>>(new Map())

const initializeUser = async () => {
  try {
    const savedUserId = localStorage.getItem('chatUserId')
    const savedUser = localStorage.getItem('chatUser')
    
    if (savedUserId && savedUser) {
      currentUserId.value = savedUserId
      currentUser.value = JSON.parse(savedUser)
      isAuthenticated.value = true
    } else {
      // Guest mode - generate temporary ID
      currentUserId.value = `guest_${Math.random().toString(36).substring(2, 11)}`
      currentUser.value = {
        _id: currentUserId.value,
        username: `Guest_${currentUserId.value.slice(-4)}`,
        firstName: 'Guest',
        lastName: 'User'
      }
      isAuthenticated.value = false
    }
  } catch (error) {
    console.error('Failed to initialize user:', error)
    currentUserId.value = `guest_${Math.random().toString(36).substring(2, 11)}`
    currentUser.value = {
      _id: currentUserId.value,
      username: `Guest_${currentUserId.value.slice(-4)}`,
      firstName: 'Guest',
      lastName: 'User'
    }
    isAuthenticated.value = false
  }
}

const selectedUser = computed(() => selectedConversation.value?.user || null)

onMounted(async () => {
  await initializeUser()
  if (currentUserId.value) {
    connect(currentUserId.value)
  }
})

watch(selectedConversation, (newConv) => {
  if (newConv) {
    loadMessages(newConv.id)
  }
})

const loadMessages = async (conversationId: string) => {
  try {
    const response = await $fetch(`/api/messages/${conversationId}`)
    messages.value = response.data.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
      isOwn: msg.senderId === currentUserId.value
    }))
  } catch (error) {
    console.error('Failed to load messages:', error)
    messages.value = []
  }
}

const handleUserSelected = (user: User) => {
  if (!user || !user._id) {
    console.error('Invalid user selected:', user)
    return
  }
  
  if (!currentUserId.value) {
    console.error('Current user ID not available')
    return
  }
  
  const existingConversation = conversations.value.find(conv => conv.user?._id === user._id)
  
  if (existingConversation) {
    selectedConversation.value = existingConversation
  } else {
    const newConversation: Conversation = {
      id: `conv_${currentUserId.value}_${user._id}`,
      user,
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0
    }
    
    conversations.value.unshift(newConversation)
    selectedConversation.value = newConversation
  }
  
  if (selectedConversation.value) {
    console.log('Loading messages for new conversation:', selectedConversation.value)
    loadConversationMessages(selectedConversation.value.id)
  }
}

const handleConversationSelected = (conversation: Conversation) => {
  if (!conversation || !conversation.id) {
    console.error('Invalid conversation selected:', conversation)
    return
  }
  
  console.log('Selecting conversation:', conversation)
  console.log('Conversation user:', conversation.user)
  
  selectedConversation.value = conversation
  loadConversationMessages(conversation.id)
}

const loadConversationMessages = async (conversationId: string) => {
  try {
    try {
      const response = await fetch(`/api/messages/${conversationId}`)
      const data = await response.json()
      
      if (data.success && data.data.length > 0) {
        const dbMessages = data.data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          isOwn: msg.senderId === currentUserId.value
        }))
        
        messages.value = dbMessages
        
        messageStore.value.set(conversationId, dbMessages)
        
        console.log(`Loaded ${messages.value.length} messages from database`)
        return
      }
    } catch (apiError) {
      console.log('Database not available, using in-memory store')
    }
    
    const storedMessages = messageStore.value.get(conversationId) || []
    messages.value = [...storedMessages]
    
    console.log(`Loaded ${messages.value.length} messages from memory`)
  } catch (error) {
    console.error('Failed to load conversation messages:', error)
    messages.value = []
  }
}

const handleCloseConversation = () => {
  selectedConversation.value = null
}


const handleSendMessage = async (content: string, receiverId: string) => {
  if (!content.trim() || !selectedConversation.value) return
  
  const message: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    content,
    timestamp: new Date(),
    isOwn: true,
    senderId: currentUserId.value,
    receiverId
  }
  
  messages.value.push(message)
  
  const conversationId = selectedConversation.value.id
  if (!messageStore.value.has(conversationId)) {
    messageStore.value.set(conversationId, [])
  }
  messageStore.value.get(conversationId)!.push(message)
  
  selectedConversation.value.lastMessage = content
  selectedConversation.value.lastMessageTime = new Date()
  
  try {
    await sendChatMessage(selectedConversation.value.id, receiverId, content, currentUserId.value)
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

onMounted(() => {
  onMessage((data: any) => {
    if (data.type === 'connected') {
      return
    }
    
    if (data.type === 'new-message') {
      const message = data.message
      
      if (!message || !message.senderId || !message.receiverId) {
        console.error('Invalid message data received:', message)
        return
      }
      
      console.log('Processing incoming message:', message)
      console.log('Current user ID:', currentUserId.value)
      console.log('Message is for me:', message.receiverId === currentUserId.value)
      
      if (message.receiverId !== currentUserId.value) {
        console.log('Message not for this user, ignoring')
        return
      }
      
      const formattedMessage: Message = {
        ...message,
        timestamp: new Date(message.timestamp),
        isOwn: false // Incoming messages are never own
      }
      
      console.log('Formatted incoming message:', formattedMessage)
      
      const conversationId = `conv_${message.senderId}_${currentUserId.value}`
      if (!messageStore.value.has(conversationId)) {
        messageStore.value.set(conversationId, [])
      }
      messageStore.value.get(conversationId)!.push(formattedMessage)
      
      if (selectedConversation.value && 
          message.senderId === selectedConversation.value.user?._id) {
        messages.value.push(formattedMessage)
        console.log('Added message to current conversation')
      } else {
        console.log('Message stored but not displayed (different conversation)')
        console.log('Selected conversation user ID:', selectedConversation.value?.user?._id)
        console.log('Message sender ID:', message.senderId)
      }
      
      let conversation = conversations.value.find(conv => 
        conv.user?._id === message.senderId
      )
      
      if (!conversation) {
        console.log('Creating new conversation for sender:', message.senderId)
        // Note: This is async but we don't await to avoid blocking message processing
        createConversationFromMessage(message)
      } else {
        console.log('Updating existing conversation')
        conversation.lastMessage = message.content
        conversation.lastMessageTime = new Date(message.timestamp)
        conversation.unreadCount++
      }
    }
  })
})

const logout = () => {
  if (isConnected.value) disconnect()
  localStorage.removeItem('chatUserId')
  localStorage.removeItem('chatUser')
  isAuthenticated.value = false
  
  setTimeout(() => {
    connect(currentUserId.value)
  }, 100)
}

const createConversationFromMessage = async (message: any) => {
  let userData = null
  
  // Check cache first
  if (userCache.value.has(message.senderId)) {
    userData = userCache.value.get(message.senderId)!
    console.log('Using cached user data for:', message.senderId)
  } else {
    // Try to fetch user data from API
    try {
      const response = await fetch(`/api/users/${message.senderId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          userData = {
            _id: result.data._id,
            username: result.data.username,
            firstName: result.data.firstName || result.data.username,
            lastName: result.data.lastName || '',
            email: result.data.email
          }
          
          // Cache the user data
          userCache.value.set(message.senderId, userData)
          console.log('Fetched and cached user data for:', message.senderId)
        }
      }
    } catch (error) {
      console.log('Failed to fetch user data from API, trying search fallback')
    }
    
    // Fallback: Try search API
    if (!userData) {
      try {
        const searchResponse = await fetch(`/api/users/search?q=${message.senderId}`)
        if (searchResponse.ok) {
          const searchResult = await searchResponse.json()
          if (searchResult.success && searchResult.data.length > 0) {
            const foundUser = searchResult.data.find((user: any) => user._id === message.senderId)
            if (foundUser) {
              userData = {
                _id: foundUser._id,
                username: foundUser.username,
                firstName: foundUser.firstName || foundUser.username,
                lastName: foundUser.lastName || '',
                email: foundUser.email
              }
              
              // Cache the user data
              userCache.value.set(message.senderId, userData)
              console.log('Found via search and cached user data for:', message.senderId)
            }
          }
        }
      } catch (error) {
        console.log('Search API also failed, using fallback')
      }
    }
    
    // Final fallback: Create basic user data
    if (!userData) {
      userData = {
        _id: message.senderId,
        username: `User_${message.senderId.slice(-4)}`,
        firstName: 'Unknown',
        lastName: 'User'
      }
      
      // Cache even the fallback data to avoid repeated failures
      userCache.value.set(message.senderId, userData)
      console.log('Using fallback user data for:', message.senderId)
    }
  }
  
  const conversation: Conversation = {
    id: `conv_${message.senderId}_${currentUserId.value}`,
    user: userData,
    lastMessage: message.content,
    lastMessageTime: new Date(message.timestamp),
    unreadCount: 1
  }
  
  conversations.value.unshift(conversation)
}
</script>

<template>
  <div class="min-h-screen bg-black flex">
    <!-- User Status -->
    
    <!-- <div class="fixed top-4 right-4 bg-gray-800 p-3 rounded-lg text-white text-sm z-50">
      <div class="mb-2 font-semibold">Current User:</div>
      <div v-if="currentUser" class="mb-2">
        <div class="font-medium">{{ currentUser.firstName }} {{ currentUser.lastName }}</div>
        <div class="text-xs text-gray-400">@{{ currentUser.username }}</div>
        <div class="text-xs" :class="isAuthenticated ? 'text-green-400' : 'text-yellow-400'">
          {{ isAuthenticated ? '🟢 Authenticated' : '🟡 Guest Mode' }}
        </div>
      </div>
    </div> -->
    
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
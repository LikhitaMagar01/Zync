// Database schema definitions
export interface User {
  _id?: string
  username: string
  email: string
  password: string // hashed
  firstName?: string
  lastName?: string
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  refreshTokens?: string[] // array of active refresh tokens
}

export interface Chat {
  _id?: string
  name: string
  type: 'private' | 'group'
  participants: string[] // user IDs
  createdBy: string // user ID
  createdAt: Date
  updatedAt: Date
  lastMessage?: {
    content: string
    sentBy: string
    sentAt: Date
  }
}

export interface Message {
  _id?: string
  chatId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'file'
  sentAt: Date
  editedAt?: Date
  isDeleted: boolean
  replyTo?: string // message ID
}

export interface ScheduledMessage {
  _id?: string
  chatId: string
  senderId: string
  content: string
  scheduledFor: Date
  isSent: boolean
  createdAt: Date
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats',
  MESSAGES: 'messages',
  SCHEDULED_MESSAGES: 'scheduled_messages'
} as const

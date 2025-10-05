import { getDatabaseService } from '../../database/utils'

declare const useNitroApp: () => { db?: any }

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  conversationId: string
  timestamp: string
}

export default defineEventHandler(async (event) => {
  try {
    const conversationId = getRouterParam(event, 'conversationId')

    if (!conversationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Conversation ID is required'
      })
    }

    let messages: Message[] = []

    try {
      const db = useNitroApp().db
      if (db) {
        const dbService = getDatabaseService(db)
        const dbMessages = await dbService.getChatMessages(conversationId, 100)

        messages = dbMessages.reverse().map(msg => ({
          id: msg._id.toString(),
          content: msg.content,
          senderId: msg.senderId,
          receiverId: '',
          conversationId: msg.chatId,
          timestamp: msg.sentAt.toISOString()
        }))
      }
    } catch (dbError) {
      console.log('Database not available, returning empty messages')
      messages = []
    }

    return {
      success: true,
      data: messages,
      count: messages.length
    }
  } catch (error) {
    console.error('Get messages error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch messages'
    })
  }
})
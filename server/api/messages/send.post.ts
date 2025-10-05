import { z } from 'zod'
import { sendMessageToUser } from '../../utils/chatConnections'
import { getDatabaseService } from '../../database/utils'

declare const useNitroApp: () => { db?: any }

const sendMessageSchema = z.object({
  conversationId: z.string(),
  receiverId: z.string(),
  senderId: z.string().optional(),
  content: z.string().min(1).max(1000)
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { conversationId, receiverId, content } = sendMessageSchema.parse(body)

    const senderId = getHeader(event, 'x-user-id') || body.senderId || 'anonymous'
    
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      content,
      senderId,
      receiverId,
      conversationId,
      timestamp: new Date().toISOString()
    }

    // Save message to database
    try {
      const db = useNitroApp().db
      if (db) {
        const dbService = getDatabaseService(db)
        
        await dbService.createMessage({
          _id: message.id,
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          conversationId: message.conversationId,
          timestamp: new Date(message.timestamp),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    } catch (dbError) {
      console.error('Failed to save message to database:', dbError)
      // Continue with SSE delivery even if database save fails
    }

    // Send message to receiver via SSE
    sendMessageToUser(receiverId, {
      type: 'new-message',
      message
    })

    return {
      success: true,
      data: message
    }
  } catch (error) {
    console.error('Send message error:', error)
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to send message'
    })
  }
})
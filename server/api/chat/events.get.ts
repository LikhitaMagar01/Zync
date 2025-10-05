import { addConnection, removeConnection } from '../../utils/chatConnections'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = query.userId as string

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required'
    })
  }

  // Set headers for SSE
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Headers', 'Cache-Control')

  // Create a readable stream
  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      addConnection(userId, controller)

      // Send initial connection message
      const data = JSON.stringify({ type: 'connected', userId })
      controller.enqueue(`data: ${data}\n\n`)
    },
    cancel() {
      // Clean up connection
      removeConnection(userId)
    }
  })

  return stream
})


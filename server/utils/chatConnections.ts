// Simple in-memory store for demo purposes
const connections = new Map<string, any>()
const messageQueue = new Map<string, any[]>()

export const addConnection = (userId: string, controller: any) => {
  connections.set(userId, controller)

  // Send any queued messages
  const queued = messageQueue.get(userId) || []
  queued.forEach(message => {
    const data = JSON.stringify(message)
    controller.enqueue(`data: ${data}\n\n`)
  })
  messageQueue.delete(userId)
}

export const removeConnection = (userId: string) => {
  connections.delete(userId)
}

export const sendMessageToUser = (userId: string, message: any) => {
  console.log(`📤 [SERVER] Attempting to send message to user ${userId}`)
  console.log(`📤 [SERVER] Message:`, message)
  console.log(`📤 [SERVER] Active connections:`, Array.from(connections.keys()))
  
  const connection = connections.get(userId)
  if (connection) {
    try {
      const data = JSON.stringify(message)
      connection.enqueue(`data: ${data}\n\n`)
      console.log(`✅ [SERVER] Message sent successfully to user ${userId}`)
    } catch (error) {
      console.error(`❌ [SERVER] Error sending message to user ${userId}:`, error)
      connections.delete(userId)
    }
  } else {
    console.log(`⚠️ [SERVER] User ${userId} not connected, queuing message`)
    // Queue message if user not connected
    if (!messageQueue.has(userId)) {
      messageQueue.set(userId, [])
    }
    messageQueue.get(userId)!.push(message)
  }
}

export const getActiveConnections = () => {
  return Array.from(connections.keys())
}
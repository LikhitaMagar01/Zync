import { ref, onMounted, onUnmounted, readonly } from 'vue'

interface Message {
    id: string
    content: string
    senderId: string
    receiverId: string
    timestamp: string
}

export const useChat = () => {
    const eventSource = ref<EventSource | null>(null)
    const isConnected = ref(false)
    const messageCallbacks = ref<((message: any) => void)[]>([])

    const connect = (userId: string) => {
        if (!eventSource.value && userId) {
            eventSource.value = new EventSource(`/api/chat/events?userId=${userId}`)

            eventSource.value.onopen = () => {
                isConnected.value = true
            }

            eventSource.value.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    messageCallbacks.value.forEach(callback => callback(data))
                } catch (error) {
                    console.error('Error parsing message:', error)
                }
            }

            eventSource.value.onerror = () => {
                isConnected.value = false
            }
        }
    }

    const disconnect = () => {
        if (eventSource.value) {
            eventSource.value.close()
            eventSource.value = null
            isConnected.value = false
        }
    }

    const onMessage = (callback: (data: any) => void) => {
        messageCallbacks.value.push(callback)
    }

    const offMessage = (callback: (data: any) => void) => {
        const index = messageCallbacks.value.indexOf(callback)
        if (index > -1) {
            messageCallbacks.value.splice(index, 1)
        }
    }

    const sendMessage = async (conversationId: string, receiverId: string, content: string, senderId: string) => {
        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversationId,
                    receiverId,
                    senderId,
                    content
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            return data.data
        } catch (error) {
            console.error('Failed to send message:', error)
            throw error
        }
    }

    onUnmounted(() => {
        disconnect()
    })

    return {
        isConnected: readonly(isConnected),
        connect,
        disconnect,
        onMessage,
        offMessage,
        sendMessage
    }
}
import { getActiveConnections } from '../../utils/chatConnections'
import { getDatabaseService } from '../../database/utils'

declare const useNitroApp: () => { db?: any }

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const searchQuery = query.q as string

    if (!searchQuery || searchQuery.trim().length === 0) {
      return {
        success: false,
        message: 'Search query is required',
        data: []
      }
    }

    // Get active connections to show online status
    const activeConnections = getActiveConnections()

    try {
      // Try to search actual database users
    const db = useNitroApp().db
      if (db) {
        const dbService = getDatabaseService(db)
        
        // Search users in database
        const users = await dbService.findUsers({
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } }
          ],
          isActive: true
        })

        // Format users and add online status
        const formattedUsers = users.map(user => ({
          _id: user._id.toString(),
          username: user.username,
          firstName: user.firstName || user.username,
          lastName: user.lastName || '',
          email: user.email,
          bio: user.bio || `User ${user.username}`,
          isOnline: activeConnections.some(connId => 
            connId.includes(user._id.toString()) || 
            connId.includes(user.username.toLowerCase())
          )
        }))

        return {
          success: true,
          data: formattedUsers,
          count: formattedUsers.length
        }
      }
    } catch (dbError) {
      console.log('Database not available, using mock data')
    }
  } catch (error) {
    console.error('Error searching users:', error)
    return {
      success: false,
      message: 'Failed to search users',
      data: []
    }
  }
})

import { getDatabaseService } from '../../database/utils'

declare const defineEventHandler: (handler: (event: any) => any) => any
declare const useNitroApp: () => { db?: any }
declare const getQuery: (event: any) => Record<string, any>

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

    const db = useNitroApp().db
    if (!db) {
      throw new Error('Database connection not available')
    }

    const dbService = getDatabaseService(db)
    
    const users = await dbService.findUsers({
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } }
      ]
    })

    const filteredUsers = users.map(user => ({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      bio: user.bio
    }))

    return {
      success: true,
      data: filteredUsers,
      count: filteredUsers.length
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

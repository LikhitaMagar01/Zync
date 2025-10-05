import { getDatabaseService } from '../../database/utils'

declare const useNitroApp: () => { db?: any }

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    let user = null

    try {
      // Try to fetch user from database
      const db = useNitroApp().db
      if (db) {
        const dbService = getDatabaseService(db)
        user = await dbService.findUserById(userId)
        
        if (user) {
          // Format user data for frontend (remove sensitive info)
          const userData = {
            _id: user._id.toString(),
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            isActive: user.isActive
          }
          
          return {
            success: true,
            data: userData
          }
        }
      }
    } catch (dbError) {
      console.log('Database not available for user lookup')
    }

    // If user not found in database, return error
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })

  } catch (error:any) {
    console.error('Get user error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user'
    })
  }
})
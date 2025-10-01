import { getDatabaseService } from '../database/utils'
import { verifyAccessToken } from '../utils/auth'

declare const defineEventHandler: (handler: (event: any) => any) => any
declare const useNitroApp: () => { db?: any }
declare const getCookie: (event: any, name: string) => string | undefined
declare const createError: (options: any) => any

export default defineEventHandler(async (event) => {
  try {
    const accessToken = getCookie(event, 'access_token')
    
    if (!accessToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Access token not found'
      })
    }

    const decoded = verifyAccessToken(accessToken)
    if (!decoded || !decoded.userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid access token'
      })
    }

    const db = useNitroApp().db
    if (!db) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Database connection not available'
      })
    }

    const dbService = getDatabaseService(db)

    const user = await dbService.findUserById(decoded.userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return {
      success: true,
      data: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      }
    }

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get user profile'
    })
  }
})

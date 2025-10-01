import { getDatabaseService } from '../database/utils'
import { verifyAccessToken } from '../utils/auth'
import { Logger } from '../utils/logger'

declare const defineEventHandler: (handler: (event: any) => any) => any
declare const useNitroApp: () => { db?: any }
declare const getCookie: (event: any, name: string) => string | undefined
declare const createError: (options: any) => any

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  
  try {
    const accessToken = getCookie(event, 'access_token')
    
    if (!accessToken) {
      Logger.authError('profile_no_access_token', { 
        userAgent: event.headers['user-agent'],
        ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown'
      })
      throw createError({
        statusCode: 401,
        statusMessage: 'Access token not found'
      })
    }

    const decoded = verifyAccessToken(accessToken)
    if (!decoded || !decoded.userId) {
      Logger.authError('profile_invalid_access_token', { 
        hasDecoded: !!decoded,
        userId: decoded?.userId
      })
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid access token'
      })
    }

    const db = useNitroApp().db
    if (!db) {
      Logger.dbError('profile_lookup', 'users', { 
        message: 'Database connection not available',
        userId: decoded.userId 
      })
      throw createError({
        statusCode: 503,
        statusMessage: 'Database connection not available'
      })
    }

    const dbService = getDatabaseService(db)

    Logger.dbOperation('find_user_by_id', 'users', { userId: decoded.userId })
    const user = await dbService.findUserById(decoded.userId)
    if (!user) {
      Logger.authError('profile_user_not_found', { userId: decoded.userId })
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    const duration = Date.now() - startTime
    Logger.authEvent('profile_success', { 
      userId: decoded.userId,
      email: user.email,
      duration
    })

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
    const duration = Date.now() - startTime
    
    if (error.statusCode) {
      Logger.authError('profile_failed', { 
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
        duration,
        error: error.message || error
      })
      throw error
    }
    
    Logger.authError('profile_unknown_error', { 
      duration,
      error: error.message || error,
      stack: error.stack
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get user profile'
    })
  }
})

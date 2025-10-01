import { getDatabaseService } from '../../server/database/utils'
import { 
  verifyRefreshToken, 
  generateAccessToken, 
  generateRefreshToken, 
  generateRefreshTokenId,
  setAuthCookies 
} from '../../server/utils/auth'
import { Logger } from '../../server/utils/logger'

declare const defineEventHandler: (handler: (event: any) => any) => any
declare const useNitroApp: () => { db?: any }
declare const getCookie: (event: any, name: string) => string | undefined
declare const createError: (options: any) => any

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  
  try {
    Logger.authEvent('refresh_token_request', { 
      userAgent: event.headers['user-agent'],
      ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown'
    })
    
    const refreshToken = getCookie(event, 'refresh_token')
    
    if (!refreshToken) {
      Logger.authError('refresh_token_missing', { 
        message: 'No refresh token cookie found',
        userAgent: event.headers['user-agent']
      })
      throw createError({
        statusCode: 401,
        statusMessage: 'No refresh token provided'
      })
    }

    const tokenPayload = verifyRefreshToken(refreshToken)
    
    if (!tokenPayload || tokenPayload.type !== 'refresh') {
      Logger.authError('refresh_token_invalid', { 
        message: 'Invalid refresh token format or type',
        hasPayload: !!tokenPayload,
        tokenType: tokenPayload?.type
      })
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid refresh token'
      })
    }

    // Get database service
    const db = useNitroApp().db
    
    if (!db) {
      Logger.dbError('refresh_token_lookup', 'users', { 
        message: 'Database connection not available',
        userId: tokenPayload.userId 
      })
      throw createError({
        statusCode: 503,
        statusMessage: 'Database connection not available'
      })
    }

    const dbService = getDatabaseService(db)

    // Verify refresh token exists in database
    if (!tokenPayload.refreshTokenId) {
      Logger.authError('refresh_token_missing_id', { 
        message: 'No refresh token ID in payload',
        userId: tokenPayload.userId 
      })
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid refresh token format'
      })
    }

    Logger.dbOperation('find_user_by_refresh_token', 'users', { 
      userId: tokenPayload.userId, 
      refreshTokenId: tokenPayload.refreshTokenId 
    })
    
    const user = await dbService.findUserByRefreshToken(tokenPayload.userId, tokenPayload.refreshTokenId)
    
    if (!user) {
      Logger.authError('refresh_token_not_found', { 
        message: 'Refresh token not found in database or user not found',
        userId: tokenPayload.userId,
        refreshTokenId: tokenPayload.refreshTokenId
      })
      throw createError({
        statusCode: 401,
        statusMessage: 'Refresh token not found or expired'
      })
    }

    // Generate new tokens
    const newTokenPayload = {
      userId: user._id!.toString(),
      email: user.email,
      username: user.username
    }
    
    Logger.authEvent('token_generation', { 
      userId: user._id!.toString(),
      email: user.email 
    })
    
    const newAccessToken = generateAccessToken(newTokenPayload)
    const newRefreshTokenId = generateRefreshTokenId()
    const newRefreshToken = generateRefreshToken(newTokenPayload, newRefreshTokenId)

    // Update refresh tokens in database
    Logger.dbOperation('remove_refresh_token', 'users', { 
      userId: user._id!.toString(), 
      oldRefreshTokenId: tokenPayload.refreshTokenId 
    })
    await dbService.removeRefreshToken(user._id!.toString(), tokenPayload.refreshTokenId)
    
    Logger.dbOperation('add_refresh_token', 'users', { 
      userId: user._id!.toString(), 
      newRefreshTokenId 
    })
    await dbService.addRefreshToken(user._id!.toString(), newRefreshTokenId)

    // Set new cookies
    setAuthCookies(event, newAccessToken, newRefreshToken)
    
    const duration = Date.now() - startTime
    Logger.authEvent('refresh_token_success', { 
      userId: user._id!.toString(),
      email: user.email,
      duration,
      newRefreshTokenId
    })

    return {
      success: true,
      message: 'Tokens refreshed successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      }
    }

  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error.statusCode) {
      Logger.authError('refresh_token_failed', { 
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
        duration,
        error: error.message || error
      })
      throw error
    }
    
    Logger.authError('refresh_token_unknown_error', { 
      duration,
      error: error.message || error,
      stack: error.stack
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Token refresh failed'
    })
  }
})

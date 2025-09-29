import { getDatabaseService } from '../../server/database/utils'
import { 
  verifyRefreshToken, 
  generateAccessToken, 
  generateRefreshToken, 
  generateRefreshTokenId,
  setAuthCookies 
} from '../../server/utils/auth'

declare const defineEventHandler: (handler: (event: any) => any) => any
declare const useNitroApp: () => { db?: any }
declare const getCookie: (event: any, name: string) => string | undefined
declare const createError: (options: any) => any

export default defineEventHandler(async (event) => {
  try {
    const refreshToken = getCookie(event, 'refresh_token')
    
    if (!refreshToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No refresh token provided'
      })
    }

    const tokenPayload = verifyRefreshToken(refreshToken)
    if (!tokenPayload || tokenPayload.type !== 'refresh') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid refresh token'
      })
    }

    // Get database service
    const db = useNitroApp().db
    if (!db) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Database connection not available'
      })
    }

    const dbService = getDatabaseService(db)

    // Verify refresh token exists in database
    if (!tokenPayload.refreshTokenId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid refresh token format'
      })
    }

    const user = await dbService.findUserByRefreshToken(tokenPayload.userId, tokenPayload.refreshTokenId)
    if (!user) {
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
    
    const newAccessToken = generateAccessToken(newTokenPayload)
    const newRefreshTokenId = generateRefreshTokenId()
    const newRefreshToken = generateRefreshToken(newTokenPayload, newRefreshTokenId)

    // Update refresh tokens in database
    await dbService.removeRefreshToken(user._id!.toString(), tokenPayload.refreshTokenId)
    await dbService.addRefreshToken(user._id!.toString(), newRefreshTokenId)

    // Set new cookies
    setAuthCookies(event, newAccessToken, newRefreshToken)

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
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Token refresh failed'
    })
  }
})

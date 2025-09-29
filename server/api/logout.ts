import { getDatabaseService } from '../../server/database/utils'
import { verifyRefreshToken, clearAuthCookies } from '../../server/utils/auth'

declare const defineEventHandler: (handler: (event: any) => any) => any
declare const useNitroApp: () => { db?: any }
declare const getCookie: (event: any, name: string) => string | undefined
declare const createError: (options: any) => any

export default defineEventHandler(async (event) => {
  try {
    const refreshToken = getCookie(event, 'refresh_token')
    
    if (refreshToken) {
      const tokenPayload = verifyRefreshToken(refreshToken)
      
      if (tokenPayload && tokenPayload.type === 'refresh') {
        const db = useNitroApp().db
        if (db) {
          const dbService = getDatabaseService(db)
          
          if (tokenPayload.refreshTokenId) {
            await dbService.removeRefreshToken(tokenPayload.userId, tokenPayload.refreshTokenId)
          }
        }
      }
    }

    clearAuthCookies(event)

    return {
      success: true,
      message: 'Logged out successfully'
    }

  } catch (error) {
    clearAuthCookies(event)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Logout failed'
    })
  }
})

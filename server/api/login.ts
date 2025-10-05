import { getDatabaseService } from '../../server/database/utils'
import { validateUserLogin, type UserLoginInput } from '../../server/utils/validation'
import { 
  comparePassword, 
  generateAccessToken, 
  generateRefreshToken, 
  generateRefreshTokenId,
  setAuthCookies 
} from '../../server/utils/auth'
import { Logger } from '../../server/utils/logger'

declare const defineEventHandler: (handler: (event: any) => any) => any
declare const useNitroApp: () => { db?: any }
declare const readBody: (event: any) => Promise<any>
declare const createError: (options: any) => any

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  
  try {
    const body = await readBody(event)
    
    Logger.authEvent('login_attempt', { 
      email: body.email,
      userAgent: event.headers['user-agent'],
      ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown'
    })
    
    // Validate input data with Zod
    const validation = validateUserLogin(body)
    if (!validation.success) {
      Logger.authError('login_validation_failed', { 
        email: body.email,
        errors: validation.errors
      })
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: { errors: validation.errors }
      })
    }

    const { email, password } = validation.data as UserLoginInput

    // Get database service
    const db = useNitroApp().db
    if (!db) {
      Logger.dbError('login_lookup', 'users', { 
        message: 'Database connection not available',
        email 
      })
      throw createError({
        statusCode: 503,
        statusMessage: 'Database connection not available'
      })
    }

    const dbService = getDatabaseService(db)

    // Find user by email
    Logger.dbOperation('find_user_by_email', 'users', { email })
    const user = await dbService.findUserByEmail(email)
    if (!user) {
      Logger.authError('login_user_not_found', { email })
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      Logger.authError('login_invalid_password', { 
        email,
        userId: user._id?.toString()
      })
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    const tokenPayload = {
      userId: user._id!.toString(),
      email: user.email,
      username: user.username
    }
    
    Logger.authEvent('token_generation', { 
      userId: user._id!.toString(),
      email: user.email 
    })
    
    const accessToken = generateAccessToken(tokenPayload)
    const refreshTokenId = generateRefreshTokenId()
    const refreshToken = generateRefreshToken(tokenPayload, refreshTokenId)

    Logger.dbOperation('update_user_login', 'users', { 
      userId: user._id!.toString(),
      refreshTokenId 
    })
    
    await dbService.updateUser(user._id!.toString(), { 
      lastLogin: new Date(),
      refreshTokens: [...(user.refreshTokens || []), refreshTokenId]
    })

    setAuthCookies(event, accessToken, refreshToken)
    
    const duration = Date.now() - startTime
    Logger.authEvent('login_success', { 
      userId: user._id!.toString(),
      email: user.email,
      duration,
      refreshTokenId
    })

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      }
    }

  } catch (error:any) {
    const duration = Date.now() - startTime
    
    if (error.statusCode) {
      Logger.authError('login_failed', { 
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
        duration,
        error: error.message || error
      })
      throw error
    }
    
    Logger.authError('login_unknown_error', { 
      duration,
      error: error.message || error,
      stack: error.stack
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Login failed'
    })
  }
})

import { getDatabaseService } from '../../server/database/utils'
import { validateUserLogin, type UserLoginInput } from '../../server/utils/validation'
import { 
  comparePassword, 
  generateAccessToken, 
  generateRefreshToken, 
  generateRefreshTokenId,
  setAuthCookies 
} from '../../server/utils/auth'

declare const defineEventHandler: (handler: (event: any) => any) => any
declare const useNitroApp: () => { db?: any }
declare const readBody: (event: any) => Promise<any>
declare const createError: (options: any) => any

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Validate input data with Zod
    const validation = validateUserLogin(body)
    if (!validation.success) {
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
      throw createError({
        statusCode: 503,
        statusMessage: 'Database connection not available'
      })
    }

    const dbService = getDatabaseService(db)

    // Find user by email
    const user = await dbService.findUserByEmail(email)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
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
    
    const accessToken = generateAccessToken(tokenPayload)
    const refreshTokenId = generateRefreshTokenId()
    const refreshToken = generateRefreshToken(tokenPayload, refreshTokenId)

    await dbService.updateUser(user._id!.toString(), { 
      lastLogin: new Date(),
      refreshTokens: [...(user.refreshTokens || []), refreshTokenId]
    })

    setAuthCookies(event, accessToken, refreshToken)

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

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Login failed'
    })
  }
})

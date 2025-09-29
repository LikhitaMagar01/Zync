import { getDatabaseService } from '../../server/database/utils'
import { validateUserRegistration, type UserRegistrationInput } from '../../server/utils/validation'
import { hashPassword } from '../../server/utils/auth'

declare const defineEventHandler: (handler: (event: any) => any) => any
declare const useNitroApp: () => { db?: any }
declare const readBody: (event: any) => Promise<any>
declare const createError: (options: any) => any

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validation = validateUserRegistration(body)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: { errors: validation.errors }
      })
    }

    const { username, email, password } = validation.data as UserRegistrationInput

    // Get database service
    const db = useNitroApp().db
    if (!db) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Database connection not available'
      })
    }

    const dbService = getDatabaseService(db)

    // Check if user already exists
    const existingUserByEmail = await dbService.findUserByEmail(email)
    if (existingUserByEmail) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User with this email already exists'
      })
    }

    const existingUserByUsername = await dbService.findUserByUsername(username)
    if (existingUserByUsername) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username is already taken'
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const result = await dbService.createUser({
      username,
      email,
      password: hashedPassword
    })

    return {
      success: true,
      message: 'User registered successfully',
      userId: result.insertedId
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration failed'
    })
  }
})
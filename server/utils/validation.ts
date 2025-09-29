import { z } from 'zod'

export const userRegistrationSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  email: z.string()
    .email('Please provide a valid email address'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number')
})

export const userLoginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
})

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>
export type UserLoginInput = z.infer<typeof userLoginSchema>

export function validateUserRegistration(data: unknown) {
  try {
    const validatedData = userRegistrationSchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => err.message)
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

export function validateUserLogin(data: unknown) {
  try {
    const validatedData = userLoginSchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => err.message)
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

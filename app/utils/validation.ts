import { z } from 'zod'

// Signup form validation schema
export const signupSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be at most 20 characters long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Type inference from schema
export type SignupFormData = z.infer<typeof signupSchema>

// Validation helper function
export const validateSignupForm = (data: Partial<SignupFormData>) => {
  try {
    signupSchema.parse(data)
    return { success: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {}
      error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message
        }
      })
      return { success: false, errors: fieldErrors }
    }
    return { success: false, errors: { general: 'An unexpected error occurred' } }
  }
}

export const signinSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')
})

export type SigninFormData = z.infer<typeof signinSchema>

export const validateSigninForm = (data: Partial<SigninFormData>) => {
  try {
    signinSchema.parse(data)
    return { success: true, errors: {} }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {}
      error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message
        }
      })
      return { success: false, errors: fieldErrors }
    }
    return { success: false, errors: { general: 'An unexpected error occurred' } }
  }
}

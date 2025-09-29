import { Logger } from '../../../utils/logger'

declare const defineEventHandler: (handler: (event: any) => any) => any

export default defineEventHandler(async (event) => {
  try {
    const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    
    return {
      success: true,
      configured: isConfigured,
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
      message: isConfigured 
        ? 'Google OAuth is properly configured' 
        : 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file'
    }
  } catch (error: any) {
    Logger.authError('Google OAuth status check failed', error)
    return {
      success: false,
      error: error.message
    }
  }
})

import { getGoogleAuthUrl } from '../../../utils/googleAuth'

declare const defineEventHandler: (handler: (event: any) => any) => any
declare const sendRedirect: (event: any, url: string) => void

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const forceAccountSelection = query.select_account === 'true'
    const flowType = query.flow || 'signin'
    
    console.log('🔍 Google OAuth request:', { 
      forceAccountSelection, 
      flowType,
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET 
    })
    
    const authUrl = getGoogleAuthUrl(forceAccountSelection, flowType)
    console.log('🔗 Generated Google OAuth URL:', authUrl.substring(0, 100) + '...')
    
    sendRedirect(event, authUrl)
  } catch (error: any) {
    console.error('Google OAuth error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Google OAuth not configured or failed to generate auth URL. Please check your environment variables.'
    })
  }
})

declare const getQuery: (event: any) => any

declare const createError: (options: any) => any

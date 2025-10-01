import { verifyAccessToken } from '../../server/utils/auth'
import { Logger } from '../../server/utils/logger'

declare const getCookie: (event: any, name: string) => string | undefined
declare const createError: (options: any) => any

export function authenticateUser(event: any) {
  const accessToken = getCookie(event, 'access_token')
  
  if (!accessToken) {
    Logger.authError('middleware_no_access_token', { 
      path: event.path,
      userAgent: event.headers['user-agent'],
      ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown'
    })
    throw createError({
      statusCode: 401,
      statusMessage: 'Access token required'
    })
  }

  const tokenPayload = verifyAccessToken(accessToken)
  
  if (!tokenPayload || tokenPayload.type !== 'access') {
    Logger.authError('middleware_invalid_access_token', { 
      path: event.path,
      hasPayload: !!tokenPayload,
      tokenType: tokenPayload?.type
    })
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid access token'
    })
  }

  Logger.authEvent('middleware_auth_success', { 
    userId: tokenPayload.userId,
    path: event.path
  })

  return tokenPayload
}

export function optionalAuth(event: any) {
  const accessToken = getCookie(event, 'access_token')
  
  if (!accessToken) {
    return null
  }

  const tokenPayload = verifyAccessToken(accessToken)
  
  if (!tokenPayload || tokenPayload.type !== 'access') {
    return null
  }

  return tokenPayload
}

// Default export for Nitro middleware
export default defineEventHandler(async (event) => {
  // Skip authentication for static assets, public routes, and API routes that don't need auth
  const publicRoutes = [
    '/api/login', 
    '/api/register', 
    '/api/refresh',
    '/api/logout',
    '/api/auth/google',
    '/api/auth/google/callback',
    '/api/auth/google/status'
  ]
  
  // Skip auth for static files and non-API routes
  if (!event.path.startsWith('/api/') || publicRoutes.some(route => event.path.startsWith(route))) {
    return // Allow these routes to pass without authentication
  }

  const accessToken = getCookie(event, 'access_token')

  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No access token provided'
    })
  }

  const decoded = verifyAccessToken(accessToken)

  if (!decoded || decoded.type !== 'access') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Invalid access token'
    })
  }

  // Attach user information to the event context
  event.context.auth = {
    userId: decoded.userId,
    email: decoded.email,
    username: decoded.username
  }
})

declare const defineEventHandler: (handler: (event: any) => any) => any
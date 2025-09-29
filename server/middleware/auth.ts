import { verifyAccessToken } from '../../server/utils/auth'

declare const getCookie: (event: any, name: string) => string | undefined
declare const createError: (options: any) => any

export function authenticateUser(event: any) {
  const accessToken = getCookie(event, 'access_token')
  
  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Access token required'
    })
  }

  const tokenPayload = verifyAccessToken(accessToken)
  
  if (!tokenPayload || tokenPayload.type !== 'access') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid access token'
    })
  }

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
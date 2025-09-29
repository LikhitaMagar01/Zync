import { getGoogleTokens, getGoogleUserInfo } from '../../../utils/googleAuth'
import { getDatabaseService } from '../../../database/utils'
import { generateAccessToken, generateRefreshToken, generateRefreshTokenId, setAuthCookies } from '../../../utils/auth'
import { Logger } from '../../../utils/logger'

declare const defineEventHandler: (handler: (event: any) => any) => any
declare const getQuery: (event: any) => any
declare const sendRedirect: (event: any, url: string) => void
declare const createError: (options: any) => any
declare const useNitroApp: () => { db?: any }

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { code, error, state } = query
    const flowType = state || 'signin'

    // Handle OAuth errors
    if (error) {
      Logger.authError('Google OAuth error', { error })
      sendRedirect(event, '/signin?error=oauth_error')
      return
    }

    if (!code) {
      Logger.authError('Google OAuth missing authorization code', { query })
      sendRedirect(event, '/signin?error=missing_code')
      return
    }

    // Exchange code for tokens
    const tokens = await getGoogleTokens(code)
    Logger.authEvent('Google OAuth tokens received', { hasAccessToken: !!tokens.access_token })
    
    if (!tokens.access_token) {
      Logger.authError('Google OAuth failed to get access token', { tokens })
      sendRedirect(event, '/signin?error=token_error')
      return
    }

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token)
    
    Logger.authEvent('Google OAuth user info received', {
      email: googleUser.email,
      name: googleUser.name,
      verified: googleUser.verified_email
    })

    // Get database service
    const db = useNitroApp().db
    if (!db) {
      Logger.dbError('findUserByEmail', 'users', 'Database connection not available')
      sendRedirect(event, '/signin?error=database_error')
      return
    }

    const dbService = getDatabaseService(db)

    // Check if user exists
    let user = await dbService.findUserByEmail(googleUser.email)
    
    if (!user) {
      // Create new user from Google data
      const username = googleUser.email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 4)
      
      const result = await dbService.createUser({
        username,
        email: googleUser.email,
        firstName: googleUser.given_name || googleUser.name?.split(' ')[0],
        lastName: googleUser.family_name || googleUser.name?.split(' ')[1],
        avatar: googleUser.picture,
        password: null, // No password for OAuth users
        isGoogleUser: true,
        googleId: googleUser.id,
        emailVerified: googleUser.verified_email
      })

      user = await dbService.findUserByEmail(googleUser.email)
      
      Logger.authEvent('Google OAuth user created', {
        userId: result.insertedId,
        email: googleUser.email,
        username
      })
    } else {
      // Update existing user with Google info if needed
      if (!user.isGoogleUser) {
        await dbService.updateUser(user._id!.toString(), {
          isGoogleUser: true,
          googleId: googleUser.id,
          avatar: googleUser.picture || user.avatar,
          emailVerified: googleUser.verified_email
        })
        
        Logger.authEvent('Google OAuth linked to existing user', {
          userId: user._id,
          email: googleUser.email
        })
      }
    }

    if (!user) {
      Logger.authError('Google OAuth user creation/lookup failed', { googleUser })
      sendRedirect(event, '/signin?error=user_error')
      return
    }

    // Generate tokens
    const tokenPayload = {
      userId: user._id!.toString(),
      email: user.email,
      username: user.username
    }
    
    const accessToken = generateAccessToken(tokenPayload)
    const refreshTokenId = generateRefreshTokenId()
    const refreshToken = generateRefreshToken(tokenPayload, refreshTokenId)

    // Update user with refresh token
    await dbService.updateUser(user._id!.toString(), { 
      lastLogin: new Date(),
      refreshTokens: [...(user.refreshTokens || []), refreshTokenId]
    })

    // Set auth cookies
    setAuthCookies(event, accessToken, refreshToken)

    Logger.authEvent('Google OAuth login successful', {
      userId: user._id,
      email: user.email,
      username: user.username,
      flowType
    })

    const isNewUser = !user.isGoogleUser || !user.googleId
    const pageTitle = flowType === 'signup' ? 'Google Sign-Up Complete' : 'Google Sign-In Complete'

    // Return minimal HTML that immediately closes popup and communicates with parent
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pageTitle}</title>
        </head>
        <body>
          <script>
            // Notify parent window of successful authentication
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                user: {
                  id: '${user._id}',
                  email: '${user.email}',
                  username: '${user.username}'
                },
                flowType: '${flowType}',
                isNewUser: ${isNewUser}
              }, '*');
            }
            
            // Close popup immediately
            window.close();
          </script>
        </body>
      </html>
    `

  } catch (error: any) {
    Logger.authError('Google OAuth callback error', error)
    sendRedirect(event, '/signin?error=oauth_callback_error')
  }
})

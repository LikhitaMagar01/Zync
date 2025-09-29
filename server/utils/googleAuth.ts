import { OAuth2Client } from 'google-auth-library'

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️ Google OAuth credentials not found. Google Sign-In will be disabled.')
}

// Create OAuth2 client
export const googleOAuthClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
)

// Generate Google OAuth URL
export const getGoogleAuthUrl = (forceAccountSelection = false, flowType = 'signin') => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google OAuth not configured')
  }

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]

  const authOptions: any = {
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
    prompt: 'consent'
  }

  if (forceAccountSelection) {
    authOptions.prompt = 'select_account consent'
  }
  authOptions.state = flowType
  return googleOAuthClient.generateAuthUrl(authOptions)
}

// Exchange authorization code for tokens
export const getGoogleTokens = async (code: string) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth not configured')
  }

  const { tokens } = await googleOAuthClient.getToken(code)
  return tokens
}

// Get user info from Google
export const getGoogleUserInfo = async (accessToken: string) => {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google API Error:', response.status, errorText)
      throw new Error(`Failed to fetch user info from Google: ${response.status} ${errorText}`)
    }

    const userInfo = await response.json()
    console.log('Google user info received:', { email: userInfo.email, name: userInfo.name })
    return userInfo
  } catch (error) {
    console.error('Error fetching Google user info:', error)
    throw error
  }
}

// Verify Google ID token
export const verifyGoogleIdToken = async (idToken: string) => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google OAuth not configured')
  }

  try {
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    if (!payload) {
      throw new Error('Invalid Google ID token')
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified
    }
  } catch (error) {
    throw new Error('Invalid Google ID token')
  }
}

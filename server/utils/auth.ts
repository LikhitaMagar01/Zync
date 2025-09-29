import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'secret-jwt-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'secret-refresh-key'
const ACCESS_TOKEN_EXPIRES_IN = '15m'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// JWT Token utilities

export interface TokenPayload {
  userId: string
  email: string
  username: string
  type: 'access' | 'refresh'
  refreshTokenId?: string
}

export function generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  )
}

export function generateRefreshToken(payload: Omit<TokenPayload, 'type'>, refreshTokenId: string): string {
  return jwt.sign(
    { ...payload, type: 'refresh', refreshTokenId },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  )
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload
  } catch {
    return null
  }
}

// Cookie utilities
export function setAuthCookies(event: any, accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Set access token cookie (short-lived)
  setCookie(event, 'access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/'
  })
  
  // Set refresh token cookie (long-lived)
  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  })
}

export function clearAuthCookies(event: any) {
  setCookie(event, 'access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  })
  
  setCookie(event, 'refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  })
}

// Generate random refresh token ID for tracking
export function generateRefreshTokenId(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Declare Nuxt functions
declare const setCookie: (event: any, name: string, value: string, options: any) => void

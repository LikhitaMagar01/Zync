import { defineStore } from 'pinia'
import { AuthApiService, type LoginRequest, type LoginResponse } from '../services/api'
import { Logger } from '../../server/utils/logger'

export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  lastAuthCheck: number | null
  refreshInterval: NodeJS.Timeout | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    lastAuthCheck: null,
    refreshInterval: null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && state.user !== null,
    userDisplayName: (state) => {
      if (!state.user) return ''
      return state.user.firstName && state.user.lastName 
        ? `${state.user.firstName} ${state.user.lastName}`
        : state.user.username
    }
  },

  actions: {
    async login(credentials: LoginRequest) {
      this.isLoading = true
      this.error = null

      try {        
        const response = await AuthApiService.login(credentials)
        
        if (response.success && response.data) {
          this.user = response.data.user
          this.isAuthenticated = true
          this.startProactiveRefresh()
          return { success: true, message: 'Login successful' }
        } else {
          this.error = response.message || 'Login failed'
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        this.error = error.message || 'An error occurred during login'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        this.stopProactiveRefresh()
        
        await AuthApiService.logout()
        this.user = null
        this.isAuthenticated = false
        this.error = null
        return { success: true, message: 'Logged out successfully' }
      } catch (error) {
        this.stopProactiveRefresh()
        
        this.user = null
        this.isAuthenticated = false
        this.error = null
        return { success: true, message: 'Logged out successfully' }
      }
    },

    async refreshToken() {
      try {
        Logger.authEvent('client_refresh_token_attempt', { 
          userId: this.user?.id,
          email: this.user?.email
        })
        
        const response = await AuthApiService.refreshToken()
        if (response.success) {
          Logger.authEvent('client_refresh_token_success', { 
            userId: this.user?.id,
            email: this.user?.email
          })
          return { success: true }
        } else {
          Logger.authError('client_refresh_token_failed', { 
            userId: this.user?.id,
            email: this.user?.email,
            error: response.message
          })
          return { success: false, message: response.message }
        }
      } catch (error) {
        Logger.authError('client_refresh_token_error', { 
          userId: this.user?.id,
          email: this.user?.email,
          error: error.message || error
        })
        return { success: false, message: 'Token refresh failed' }
      }
    },

    async checkAuthStatus(force = false) {
      const now = Date.now()
      const cacheTime = 30000 // 30 seconds
      
      if (!force && this.lastAuthCheck && (now - this.lastAuthCheck) < cacheTime) {
        Logger.debug('Using cached auth status', { 
          isAuthenticated: this.isAuthenticated,
          userId: this.user?.id
        })
        return this.isAuthenticated
      }
      
      Logger.authEvent('client_auth_check', { 
        force,
        userId: this.user?.id,
        email: this.user?.email
      })
      
      try {
        const response = await AuthApiService.getCurrentUser()
        
        if (response.success && response.data) {
          this.user = response.data
          this.isAuthenticated = true
          this.lastAuthCheck = now
          if (!this.refreshInterval) {
            this.startProactiveRefresh()
          }
          Logger.authEvent('client_auth_check_success', { 
            userId: this.user.id,
            email: this.user.email
          })
          return true
        } else {
          Logger.authEvent('client_auth_check_failed', { 
            userId: this.user?.id,
            email: this.user?.email,
            message: 'getCurrentUser failed, trying refresh token'
          })
          // Try refresh token if getCurrentUser fails
          const refreshResult = await this.refreshToken()
          this.lastAuthCheck = now
          
          if (refreshResult.success) {
            Logger.authEvent('client_auth_check_retry', { 
              userId: this.user?.id,
              email: this.user?.email,
              message: 'Refresh successful, retrying getCurrentUser'
            })
            // Retry getCurrentUser after successful refresh
            const retryResponse = await AuthApiService.getCurrentUser()
            if (retryResponse.success && retryResponse.data) {
              this.user = retryResponse.data
              this.isAuthenticated = true
              // Start proactive refresh if not already running
              if (!this.refreshInterval) {
                this.startProactiveRefresh()
              }
              Logger.authEvent('client_auth_check_success_after_refresh', { 
                userId: this.user.id,
                email: this.user.email
              })
              return true
            }
          }
          
          Logger.authError('client_auth_check_final_failure', { 
            userId: this.user?.id,
            email: this.user?.email,
            message: 'Refresh failed, user not authenticated',
            reasons: [
              'Refresh token expired (7+ days old)',
              'Browser cleared cookies',
              'Need to login again'
            ]
          })
          this.isAuthenticated = false
          this.user = null
          return false
        }
      } catch (error) {
        Logger.authError('client_auth_check_error', { 
          userId: this.user?.id,
          email: this.user?.email,
          error: error.message || error,
          stack: error.stack
        })
        this.isAuthenticated = false
        this.user = null
        this.lastAuthCheck = now
        return false
      }
    },

    clearError() {
      this.error = null
    },

    // Start proactive token refresh (like Instagram/Messenger)
    startProactiveRefresh() {
      // Clear any existing interval
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
      }

      Logger.authEvent('client_proactive_refresh_start', { 
        userId: this.user?.id,
        email: this.user?.email,
        interval: '14 minutes'
      })

      // Refresh token every 14 minutes (before 15-minute expiry)
      this.refreshInterval = setInterval(async () => {
        if (this.isAuthenticated) {
          Logger.authEvent('client_proactive_refresh_triggered', { 
            userId: this.user?.id,
            email: this.user?.email
          })
          
          const result = await this.refreshToken()
          if (!result.success) {
            Logger.authError('client_proactive_refresh_failed', { 
              userId: this.user?.id,
              email: this.user?.email,
              message: 'Proactive refresh failed, stopping interval'
            })
            this.stopProactiveRefresh()
          }
        }
      }, 14 * 60 * 1000) // 14 minutes
    },

    // Stop proactive token refresh
    stopProactiveRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
        
        Logger.authEvent('client_proactive_refresh_stop', { 
          userId: this.user?.id,
          email: this.user?.email
        })
      }
    },

    setUser(user: User) {
      this.user = user
      this.isAuthenticated = true
    },

    async refreshAuthState() {
      await this.checkAuthStatus(true)
      return this.isAuthenticated
    }
  }
})

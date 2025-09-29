import { defineStore } from 'pinia'
import { AuthApiService, type LoginRequest, type LoginResponse } from '../services/api'

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
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    lastAuthCheck: null
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
        await AuthApiService.logout()
        this.user = null
        this.isAuthenticated = false
        this.error = null
        return { success: true, message: 'Logged out successfully' }
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
        this.error = null
        return { success: true, message: 'Logged out successfully' }
      }
    },

    async refreshToken() {
      try {
        const response = await AuthApiService.refreshToken()
        if (response.success) {
          return { success: true }
        } else {
          await this.logout()
          return { success: false }
        }
      } catch (error) {
        await this.logout()
        return { success: false }
      }
    },

    async checkAuthStatus(force = false) {
      const now = Date.now()
      const cacheTime = 30000 // 30 seconds
      
      if (!force && this.lastAuthCheck && (now - this.lastAuthCheck) < cacheTime) {
        return this.isAuthenticated
      }
      
      try {
        const response = await AuthApiService.getCurrentUser()
        
        if (response.success && response.data) {
          this.user = response.data
          this.isAuthenticated = true
          this.lastAuthCheck = now
          return true
        } else {
          // Try refresh token if getCurrentUser fails
          const refreshResult = await this.refreshToken()
          this.lastAuthCheck = now
          return refreshResult.success
        }
      } catch (error) {
        this.isAuthenticated = false
        this.user = null
        this.lastAuthCheck = now
        return false
      }
    },

    clearError() {
      this.error = null
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

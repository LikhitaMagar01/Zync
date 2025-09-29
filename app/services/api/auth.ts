import { apiCall, type ApiResponse, type RegisterRequest, type RegisterResponse } from './config'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
    avatar?: string
  }
  accessToken?: string
}

export class AuthApiService {
  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return apiCall<RegisterResponse>('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Login user
   */
  static async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiCall<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Logout user
   */
  static async logout(): Promise<ApiResponse> {
    return apiCall('/api/logout', {
      method: 'POST',
    })
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    return apiCall<{ accessToken: string }>('/api/refresh', {
      method: 'POST',
    })
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<ApiResponse<LoginResponse['user']>> {
    return apiCall<LoginResponse['user']>('/api/profile', {
      method: 'GET',
    })
  }
}

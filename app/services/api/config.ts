import { useRuntimeConfig } from 'nuxt/app'

export const getApiBaseUrl = () => {
  // For client-side
  if (typeof window !== 'undefined') {
    return 'http://192.168.254.228:3000'
  }
  
  // For server-side
  if (typeof useRuntimeConfig !== 'undefined') {
    const config = useRuntimeConfig()
    return config.public.apiBaseUrl || 'http://localhost:3000' || 'http://192.168.254.228:3000'
  }

  return process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000' || 'http://192.168.254.228:3000'
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string>
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    username: string
  }
}

const createFetchOptions = (options: RequestInit = {}): RequestInit => ({
  headers: {
    'Content-Type': 'application/json',
    ...options.headers,
  },
  credentials: 'include',
  ...options,
})

export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const baseUrl = getApiBaseUrl()
    const fullUrl = `${baseUrl}${endpoint}`
    
    const response = await fetch(fullUrl, createFetchOptions(options))
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Received 401 Unauthorized. Attempting token refresh...')
        
        try {
          const refreshResponse = await fetch(`${baseUrl}/api/refresh`, createFetchOptions({
            method: 'POST',
          }))
          
          if (refreshResponse.ok) {            
            const retryResponse = await fetch(fullUrl, createFetchOptions(options))
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json()
              return {
                success: true,
                data: retryData as T,
                message: retryData.message || 'Success'
              }
            }
          }
          console.log('❌ Token refresh failed, returning 401 error')
        } catch (refreshError) {
          console.error('💥 Token refresh error:', refreshError)
        }
      }
      
      return {
        success: false,
        message: data.statusMessage || data.message || 'API call failed',
        errors: data.errors || {},
        data: data.data || null
      }
    }

    return {
      success: true,
      data: data as T,
      message: data.message || 'Success'
    }
  } catch (error: any) {
    console.error('API call failed:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred',
      errors: { general: error.message || 'Network error occurred' }
    }
  }
}

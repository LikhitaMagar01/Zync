import { useRuntimeConfig } from 'nuxt/app'
import { Logger } from '../../../server/utils/logger'

export const getApiBaseUrl = () => {
  // For client-side - use the same host as the current page
  if (typeof window !== 'undefined') {
    const currentHost = window.location.host
    return `http://${currentHost}`
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
  const startTime = Date.now()
  
  try {
    const baseUrl = getApiBaseUrl()
    const fullUrl = `${baseUrl}${endpoint}`
    
    // Log API request
    Logger.apiRequest(options.method || 'GET', endpoint, {
      url: fullUrl,
      headers: options.headers
    })
    
    const response = await fetch(fullUrl, createFetchOptions(options))
    const data = await response.json()
    
    const duration = Date.now() - startTime
    
    // Log API response
    Logger.apiResponse(options.method || 'GET', endpoint, response.status, duration)

    if (!response.ok) {
      if (response.status === 401) {
        Logger.authEvent('api_401_unauthorized', { 
          endpoint,
          method: options.method || 'GET',
          url: fullUrl
        })
        
        try {
          const refreshResponse = await fetch(`${baseUrl}/api/refresh`, createFetchOptions({
            method: 'POST',
          }))
          
          Logger.authEvent('refresh_token_attempt', { 
            endpoint,
            refreshStatus: refreshResponse.status
          })
          
          if (refreshResponse.ok) {
            Logger.authEvent('refresh_token_success', { 
              endpoint,
              message: 'Retrying original request'
            })
            
            const retryResponse = await fetch(fullUrl, createFetchOptions(options))
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json()
              Logger.authEvent('api_retry_success', { 
                endpoint,
                method: options.method || 'GET',
                statusCode: retryResponse.status
              })
              
              return {
                success: true,
                data: retryData as T,
                message: retryData.message || 'Success'
              }
            } else {
              Logger.authError('api_retry_failed', { 
                endpoint,
                method: options.method || 'GET',
                statusCode: retryResponse.status
              })
            }
          } else {
            const refreshData = await refreshResponse.json().catch(() => ({}))
            Logger.authError('refresh_token_failed', { 
              endpoint,
              statusCode: refreshResponse.status,
              error: refreshData.message || refreshData
            })
          }
        } catch (refreshError) {
          Logger.authError('refresh_token_error', { 
            endpoint,
            error: refreshError.message || refreshError
          })
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
    Logger.error('API call failed', { 
      endpoint,
      method: options.method || 'GET',
      error: error.message || error,
      stack: error.stack
    })
    
    return {
      success: false,
      message: error.message || 'Network error occurred',
      errors: { general: error.message || 'Network error occurred' }
    }
  }
}

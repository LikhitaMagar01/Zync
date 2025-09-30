// composables/useClientLogger.ts
export const useClientLogger = () => {
  const isClient = process.client
  const isDev = process.env.NODE_ENV === 'development'

  const log = (level: string, message: string, data?: any) => {
    if (!isClient) return

    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    }

    if (isDev) {
      // In development, use console with colors
      const emoji = {
        info: 'ℹ️',
        warn: '⚠️', 
        error: '❌',
        debug: '🔍'
      }[level] || '📝'

      console.log(`${emoji} [${level.toUpperCase()}] ${message}`, data || '')
    } else {
      // In production, send to server or external logging service
      // TODO: Send to server or external logging service
      console.log(JSON.stringify(logEntry))
    }
  }

  return {
    info: (message: string, data?: any) => log('info', message, data),
    warn: (message: string, data?: any) => log('warn', message, data),
    error: (message: string, data?: any) => log('error', message, data),
    debug: (message: string, data?: any) => log('debug', message, data),
    
    // Auth-specific logging
    authEvent: (event: string, data?: any) => log('info', `Auth Event: ${event}`, { type: 'auth_event', event, ...data }),
    authError: (event: string, data?: any) => log('error', `Auth Error: ${event}`, { type: 'auth_error', event, ...data }),
    
    // API-specific logging  
    apiRequest: (method: string, path: string, data?: any) => log('info', `API Request: ${method} ${path}`, { type: 'api_request', method, path, ...data }),
    apiResponse: (method: string, path: string, statusCode: number, duration: number) => {
      const emoji = statusCode >= 200 && statusCode < 300 ? '✅' : statusCode >= 400 ? '❌' : '⚠️'
      log('info', `${emoji} API Response: ${method} ${path} - ${statusCode} (${duration}ms)`, { 
        type: 'api_response', 
        method, 
        path, 
        statusCode, 
        duration 
      })
    }
  }
}

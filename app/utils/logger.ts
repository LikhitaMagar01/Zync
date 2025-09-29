// Client-side logging utility
export class ClientLogger {
  private static isDevelopment = process.env.NODE_ENV === 'development'

  private static formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const baseMessage = `[${timestamp}] ${level}: ${message}`
    
    if (data) {
      return `${baseMessage}\n${JSON.stringify(data, null, 2)}`
    }
    
    return baseMessage
  }

  static info(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`ℹ️  ${this.formatMessage('INFO', message, data)}`)
    }
  }

  static warn(message: string, data?: any): void {
    console.warn(`⚠️  ${this.formatMessage('WARN', message, data)}`)
  }

  static error(message: string, error?: any): void {
    console.error(`❌ ${this.formatMessage('ERROR', message, error)}`)
  }

  static success(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`✅ ${this.formatMessage('SUCCESS', message, data)}`)
    }
  }

  static debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`🐛 ${this.formatMessage('DEBUG', message, data)}`)
    }
  }

  // API-specific logging
  static apiCall(endpoint: string, method: string, data?: any): void {
    this.debug(`API Call: ${method} ${endpoint}`, data)
  }

  static apiResponse(endpoint: string, method: string, success: boolean, data?: any): void {
    const emoji = success ? '✅' : '❌'
    this.debug(`${emoji} API Response: ${method} ${endpoint}`, data)
  }

  // Auth-specific logging
  static authEvent(event: string, data?: any): void {
    this.info(`Auth Event: ${event}`, data)
  }

  static authError(event: string, error: any): void {
    this.error(`Auth Error: ${event}`, error)
  }

  // Form validation logging
  static validation(field: string, isValid: boolean, message?: string): void {
    const emoji = isValid ? '✅' : '❌'
    this.debug(`${emoji} Validation: ${field} - ${message || (isValid ? 'Valid' : 'Invalid')}`)
  }

  // User interaction logging
  static userAction(action: string, data?: any): void {
    this.debug(`User Action: ${action}`, data)
  }
}

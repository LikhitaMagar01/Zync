import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs')

// Winston configuration
const createLogger = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Define log format
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  )

  // Console format for development
  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : ''
      return `${timestamp} ${level}: ${message}${metaStr}`
    })
  )

  // Create transports
  const transports: winston.transport[] = []

  // Console transport (always enabled)
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: isDevelopment ? 'debug' : 'info'
    })
  )

  // File transports (always enabled for persistence)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
      level: 'info'
    })
  )

  // Error file transport
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
      level: 'error'
    })
  )

  // API-specific log file
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'api-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      format: logFormat,
      level: 'info'
    })
  )

  return winston.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format: logFormat,
    transports,
    // Don't exit on handled exceptions
    exitOnError: false
  })
}

// Create logger instance
const logger = createLogger()

// Enhanced Logger class with Winston
export class Logger {
  static info(message: string, data?: any): void {
    logger.info(message, data)
  }

  static warn(message: string, data?: any): void {
    logger.warn(message, data)
  }

  static error(message: string, error?: any): void {
    logger.error(message, error)
  }

  static debug(message: string, data?: any): void {
    logger.debug(message, data)
  }

  static success(message: string, data?: any): void {
    logger.info(`✅ ${message}`, data)
  }

  // API-specific logging
  static apiRequest(method: string, path: string, data?: any): void {
    logger.info(`API Request: ${method} ${path}`, { 
      type: 'api_request',
      method,
      path,
      ...data 
    })
  }

  static apiResponse(method: string, path: string, statusCode: number, duration: number): void {
    const emoji = statusCode >= 200 && statusCode < 300 ? '✅' : 
                  statusCode >= 400 ? '❌' : '⚠️'
    logger.info(`${emoji} API Response: ${method} ${path} - ${statusCode} (${duration}ms)`, {
      type: 'api_response',
      method,
      path,
      statusCode,
      duration
    })
  }

  // Auth-specific logging
  static authEvent(event: string, data?: any): void {
    logger.info(`Auth Event: ${event}`, {
      type: 'auth_event',
      event,
      ...data
    })
  }

  static authError(event: string, error: any): void {
    logger.error(`Auth Error: ${event}`, {
      type: 'auth_error',
      event,
      error: error.message || error,
      stack: error.stack
    })
  }

  // Database logging
  static dbOperation(operation: string, collection: string, data?: any): void {
    logger.debug(`DB Operation: ${operation} on ${collection}`, {
      type: 'db_operation',
      operation,
      collection,
      ...data
    })
  }

  static dbError(operation: string, collection: string, error: any): void {
    logger.error(`DB Error: ${operation} on ${collection}`, {
      type: 'db_error',
      operation,
      collection,
      error: error.message || error,
      stack: error.stack
    })
  }

  // User activity logging
  static userActivity(userId: string, action: string, data?: any): void {
    logger.info(`User Activity: ${action}`, {
      type: 'user_activity',
      userId,
      action,
      ...data
    })
  }

  // Security logging
  static securityEvent(event: string, data?: any): void {
    logger.warn(`Security Event: ${event}`, {
      type: 'security_event',
      event,
      ...data
    })
  }
}

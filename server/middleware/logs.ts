import { Logger } from '../utils/logger'

declare const defineEventHandler: (handler: (event: any) => any) => any

export default defineEventHandler((event) => {
  const startTime = Date.now()
  const method = event.node.req.method || 'UNKNOWN'
  const url = event.node.req.url || '/'
  
  // Log incoming request
  Logger.apiRequest(method, url)
  
  // Log response when request completes
  event.node.res.on('finish', () => {
    const duration = Date.now() - startTime
    const statusCode = event.node.res.statusCode
    
    Logger.apiResponse(method, url, statusCode, duration)
  })
})

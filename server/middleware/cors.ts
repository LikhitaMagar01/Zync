export default defineEventHandler(async (event) => {
  // Set CORS headers
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  setHeader(event, 'Access-Control-Allow-Credentials', 'true')

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 200)
    return ''
  }
})

declare const defineEventHandler: (handler: (event: any) => any) => any
declare const setHeader: (event: any, name: string, value: string) => void
declare const getMethod: (event: any) => string
declare const setResponseStatus: (event: any, status: number) => void

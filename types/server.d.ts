// Nuxt server utilities type declarations
declare global {
  const defineEventHandler: (handler: (event: any) => any) => any
  const readBody: (event: any) => Promise<any>
  const getQuery: (event: any) => Record<string, any>
  const getHeader: (event: any, name: string) => string | undefined
  const setHeader: (event: any, name: string, value: string) => void
  const createError: (options: { statusCode: number; statusMessage: string }) => Error
  const getRouterParam: (event: any, name: string) => string | undefined
  const useNitroApp: () => { db?: any }
}

export {}
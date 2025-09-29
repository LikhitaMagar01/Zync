import { MongoClient } from 'mongodb'

declare const defineNitroPlugin: (plugin: (nitroApp: any) => void | Promise<void>) => any
declare const useRuntimeConfig: () => { mongodbUri: string; mongodbDbName: string }

export default defineNitroPlugin(async (nitroApp: any) => {
  const config = useRuntimeConfig()
  const mongoUri = config.mongodbUri as string
  const dbName = config.mongodbDbName as string

  if (!mongoUri) {
    console.warn('MongoDB connection string is missing')
    return
  }

  const client = new MongoClient(mongoUri)

  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    nitroApp.mongoClient = client
    nitroApp.db = client.db(dbName)
    
    console.log(`Database '${dbName}' ready`)
  } catch (error) {
    console.warn('Failed to connect to MongoDB:', error.message)
  }
})

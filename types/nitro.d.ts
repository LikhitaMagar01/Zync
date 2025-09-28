import type { Db, MongoClient } from 'mongodb'

declare module 'nitropack' {
  interface NitroApp {
    db?: Db
    mongoClient?: MongoClient
  }
}

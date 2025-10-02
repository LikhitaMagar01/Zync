import { Db } from 'mongodb'
import { COLLECTIONS } from './schema'

export class DatabaseService {
  constructor(private db: Db) {}

  async createUser(userData: any) {
    return await this.db.collection(COLLECTIONS.USERS).insertOne({
      ...userData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  async findUserByEmail(email: string) {
    return await this.db.collection(COLLECTIONS.USERS).findOne({ email })
  }

  async findUserByUsername(username: string) {
    return await this.db.collection(COLLECTIONS.USERS).findOne({ username })
  }

  async findUserByGoogleId(googleId: string) {
    return await this.db.collection(COLLECTIONS.USERS).findOne({ googleId })
  }

  async findUserById(userId: string) {
    const { ObjectId } = await import('mongodb')
    return await this.db.collection(COLLECTIONS.USERS).findOne({ _id: new ObjectId(userId) })
  }

  async findUsers(query: any) {
    return await this.db.collection(COLLECTIONS.USERS)
      .find({ ...query, isActive: true })
      .toArray()
  }

  async updateUser(userId: string, updateData: any) {
    return await this.db.collection(COLLECTIONS.USERS).updateOne(
      { _id: userId as any },
      { $set: { ...updateData, updatedAt: new Date() } }
    )
  }

  async addRefreshToken(userId: string, refreshTokenId: string) {
    return await this.db.collection(COLLECTIONS.USERS).updateOne(
      { _id: userId as any },
      { $push: { refreshTokens: refreshTokenId } } as any
    )
  }

  async removeRefreshToken(userId: string, refreshTokenId: string) {
    return await this.db.collection(COLLECTIONS.USERS).updateOne(
      { _id: userId as any },
      { $pull: { refreshTokens: refreshTokenId } } as any
    )
  }

  async clearAllRefreshTokens(userId: string) {
    return await this.db.collection(COLLECTIONS.USERS).updateOne(
      { _id: userId as any },
      { $set: { refreshTokens: [] } }
    )
  }

  async findUserByRefreshToken(userId: string, refreshTokenId: string) {
    return await this.db.collection(COLLECTIONS.USERS).findOne({
      _id: userId as any,
      refreshTokens: refreshTokenId
    })
  }

  async createChat(chatData: any) {
    return await this.db.collection(COLLECTIONS.CHATS).insertOne({
      ...chatData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  async getUserChats(userId: string) {
    return await this.db.collection(COLLECTIONS.CHATS)
      .find({ participants: userId })
      .sort({ updatedAt: -1 })
      .toArray()
  }

  async createMessage(messageData: any) {
    return await this.db.collection(COLLECTIONS.MESSAGES).insertOne({
      ...messageData,
      sentAt: new Date(),
      isDeleted: false
    })
  }

  async getChatMessages(chatId: string, limit = 50) {
    return await this.db.collection(COLLECTIONS.MESSAGES)
      .find({ chatId, isDeleted: false })
      .sort({ sentAt: -1 })
      .limit(limit)
      .toArray()
  }

  async createScheduledMessage(scheduledData: any) {
    return await this.db.collection(COLLECTIONS.SCHEDULED_MESSAGES).insertOne({
      ...scheduledData,
      isSent: false,
      createdAt: new Date()
    })
  }

  async getPendingScheduledMessages() {
    return await this.db.collection(COLLECTIONS.SCHEDULED_MESSAGES)
      .find({ 
        isSent: false, 
        scheduledFor: { $lte: new Date() } 
      })
      .toArray()
  }
}

export function getDatabaseService(db: Db) {
  return new DatabaseService(db)
}

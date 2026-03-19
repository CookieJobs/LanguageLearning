import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Wallet, WalletDocument } from './wallet.schema'

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>
  ) {}

  async getWallet(userId: string): Promise<WalletDocument> {
    const userObjectId = new Types.ObjectId(userId)
    let wallet = await this.walletModel.findOne({ userId: userObjectId })
    if (!wallet) {
      wallet = await this.walletModel.create({ userId: userObjectId, balance: 0, transactions: [] })
    }
    return wallet
  }

  async createDefault(userId: string): Promise<WalletDocument> {
    return this.getWallet(userId)
  }

  async addCoins(userId: string, amount: number, reason: string): Promise<WalletDocument> {
    if (amount <= 0) return this.getWallet(userId)

    const wallet = await this.getWallet(userId)
    wallet.balance += amount
    wallet.transactions.push({
      type: 'earn',
      amount,
      reason,
      createdAt: new Date()
    })
    return wallet.save()
  }

  async spendCoins(userId: string, amount: number, reason: string): Promise<boolean> {
    if (amount <= 0) return true // No cost
    const wallet = await this.getWallet(userId)

    if (wallet.balance < amount) {
      return false
    }

    wallet.balance -= amount
    wallet.transactions.push({
      type: 'spend',
      amount,
      reason,
      createdAt: new Date()
    })
    await wallet.save()
    return true
  }
}

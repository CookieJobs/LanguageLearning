import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type WalletDocument = HydratedDocument<Wallet>

@Schema()
class Transaction {
  @Prop({ required: true, enum: ['earn', 'spend'] })
  type: string

  @Prop({ required: true })
  amount: number

  @Prop({ required: true })
  reason: string

  @Prop({ default: Date.now })
  createdAt: Date
}

const TransactionSchema = SchemaFactory.createForClass(Transaction)

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId

  @Prop({ default: 0, min: 0 })
  balance: number

  @Prop({ type: [TransactionSchema], default: [] })
  transactions: Transaction[]
}

export const WalletSchema = SchemaFactory.createForClass(Wallet)

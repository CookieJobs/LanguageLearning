// input: mongoose
// output: RefreshTokenSchema, RefreshTokenDocument
// pos: 后端/鉴权模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { HydratedDocument, Schema } from 'mongoose'

export interface RefreshToken {
  userId: string
  tokenHash: string
  expiresAt: Date
  revokedAt?: Date
  deviceInfo?: string
  ipLast?: string
}

export type RefreshTokenDocument = HydratedDocument<RefreshToken>

export const RefreshTokenSchema = new Schema<RefreshToken>({
  userId: { type: String, required: true, index: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date },
  deviceInfo: { type: String },
  ipLast: { type: String }
})

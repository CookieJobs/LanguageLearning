// input: mongoose
// output: UserSchema, UserProfileSchema, UserDocument, UserProfileDocument
// pos: 后端/用户模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { HydratedDocument, Schema } from 'mongoose'

export interface User {
  email: string
  passwordHash: string
  status: string
  createdAt: Date
}

export interface UserProfile {
  userId: string
  name?: string
  avatarUrl?: string
  educationLevel?: string
  textbook?: string
}

export type UserDocument = HydratedDocument<User>
export type UserProfileDocument = HydratedDocument<UserProfile>

export const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: () => new Date() }
})

export const UserProfileSchema = new Schema<UserProfile>({
  userId: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  avatarUrl: { type: String },
  educationLevel: { type: String },
  textbook: { type: String }
})

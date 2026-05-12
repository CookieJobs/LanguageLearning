// input: mongoose
// output: DailyActivitySchema, UserStatsSchema, DailyActivityDocument, UserStatsDocument
// pos: 后端/统计模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { HydratedDocument, Schema } from 'mongoose'

export interface DailyActivity {
  userId: string
  date: Date
}

export interface UserStats {
  userId: string
  totalMastered: number
  currentStreak: number
  longestStreak: number
  lastActivityDate?: Date | null
}

export type DailyActivityDocument = HydratedDocument<DailyActivity>
export type UserStatsDocument = HydratedDocument<UserStats>

export const DailyActivitySchema = new Schema<DailyActivity>({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true }
})
DailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true })

export const UserStatsSchema = new Schema<UserStats>({
  userId: { type: String, required: true, unique: true, index: true },
  totalMastered: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivityDate: { type: Date }
})

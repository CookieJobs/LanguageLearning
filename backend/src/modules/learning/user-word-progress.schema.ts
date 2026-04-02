import { HydratedDocument, Schema, Types } from 'mongoose'

export interface UserWordProgress {
  userId: Types.ObjectId
  wordId: Types.ObjectId
  stage: number // 0-3
  exposureCount: number
  correctCount: number
  consecutiveCorrect: number
  wrongCount: number
  wrongStreak: number // 连续答错次数，连续2次才降stage
  lastPracticedAt: Date
  nextReviewAt: Date
}

export type UserWordProgressDocument = HydratedDocument<UserWordProgress>

export const UserWordProgressSchema = new Schema<UserWordProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  wordId: { type: Schema.Types.ObjectId, ref: 'VocabWord', required: true, index: true },
  stage: { type: Number, required: true, min: 0, max: 3, default: 0 },
  exposureCount: { type: Number, required: true, default: 0 },
  correctCount: { type: Number, required: true, default: 0 },
  consecutiveCorrect: { type: Number, required: true, default: 0 },
  wrongCount: { type: Number, required: true, default: 0 },
  wrongStreak: { type: Number, required: true, default: 0 },
  lastPracticedAt: { type: Date, default: Date.now },
  nextReviewAt: { type: Date, default: Date.now, index: true }
})

UserWordProgressSchema.index({ userId: 1, wordId: 1 }, { unique: true })
UserWordProgressSchema.index({ userId: 1, nextReviewAt: 1 })

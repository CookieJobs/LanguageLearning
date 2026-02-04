// input: mongoose
// output: WordMasterySchema, WordMasteryDocument
// pos: 后端/学习模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { HydratedDocument, Schema } from 'mongoose'

export interface WordMastery {
  userId: string
  word: string
  definition: string
  partOfSpeech: string
  example: string
  userSentence: string
  masteredAt: Date
  sourceLevel?: string
}

export type WordMasteryDocument = HydratedDocument<WordMastery>

export const WordMasterySchema = new Schema<WordMastery>({
  userId: { type: String, required: true, index: true },
  word: { type: String, required: true },
  definition: { type: String, required: true },
  partOfSpeech: { type: String, required: true },
  example: { type: String, required: true },
  userSentence: { type: String, required: true },
  masteredAt: { type: Date, required: true },
  sourceLevel: { type: String, required: false }
})

WordMasterySchema.index({ userId: 1, masteredAt: -1 })

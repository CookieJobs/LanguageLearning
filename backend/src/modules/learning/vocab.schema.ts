// input: mongoose
// output: VocabWordSchema, VocabWordDocument
// pos: 后端/学习模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { HydratedDocument, Schema } from 'mongoose'

export interface GradeDefinitions {
  primary?: string
  junior?: string
  senior?: string
  [key: string]: string | undefined
}

export interface VocabWord {
  headword: string
  lemma: string
  pos: string
  cefr: string
  freqRank?: number
  definitionEn: string
  definitionZh: string
  exampleEn: string
  ipa?: string
  audioUrl?: string
  levels: string[]
  topics: string[]
  textbooks?: string[]
  source?: string
  definitions?: GradeDefinitions
  contextualDefinitions?: {
    textbook: string
    definitionZh: string
    exampleEn: string
  }[]
}

export type VocabWordDocument = HydratedDocument<VocabWord>

export const VocabWordSchema = new Schema<VocabWord>({
  headword: { type: String, required: true, index: true },
  lemma: { type: String, required: true },
  pos: { type: String, required: true },
  cefr: { type: String, required: true },
  freqRank: { type: Number },
  definitionEn: { type: String, required: true },
  definitionZh: { type: String, required: true },
  exampleEn: { type: String, required: true },
  ipa: { type: String },
  audioUrl: { type: String },
  levels: { type: [String], default: [] },
  topics: { type: [String], default: [] },
  textbooks: { type: [String], default: [] },
  source: { type: String },
  definitions: {
    primary: { type: String },
    junior: { type: String },
    senior: { type: String }
  },
  contextualDefinitions: [
    {
      textbook: { type: String, required: true },
      definitionZh: { type: String, required: true },
      exampleEn: { type: String, required: true }
    }
  ]
})

VocabWordSchema.index({ lemma: 1, pos: 1 }, { unique: true })
VocabWordSchema.index({ cefr: 1 })

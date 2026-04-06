// input: mongoose, fs, path, ../src/modules/learning/vocab.schema
// output: 无
// pos: 系统/通用
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import * as fs from 'fs'
import * as path from 'path'
import mongoose from 'mongoose'
import { VocabWordSchema } from '../src/modules/learning/vocab.schema'

async function main() {
  const file = path.resolve(__dirname, '../../data/vocab/words.json')
  const raw = fs.readFileSync(file, 'utf-8')
  const items = JSON.parse(raw)
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/linguacraft'
  await mongoose.connect(mongoUrl)
  const VocabWord =
    (mongoose.models.VocabWord as mongoose.Model<any>) ||
    mongoose.model('VocabWord', VocabWordSchema)
  const ops = items.map((it: any) => ({
    updateOne: {
      filter: { lemma: it.lemma, pos: it.pos },
      update: {
        $set: {
          headword: it.headword,
          lemma: it.lemma,
          pos: it.pos,
          cefr: it.cefr,
          freqRank: it.freq_rank ?? it.freqRank,
          definitionEn: it.definition_en ?? it.definitionEn,
          definitionZh: it.definition_zh ?? it.definitionZh,
          exampleEn: it.example_en ?? it.exampleEn,
          ipa: it.ipa,
          audioUrl: it.audioUrl,
          levels: it.levels || [],
          topics: it.topics || []
        }
      },
      upsert: true
    }
  }))
  const batchSize = 500
  for (let i = 0; i < ops.length; i += batchSize) {
    const chunk = ops.slice(i, i + batchSize)
    await (VocabWord as any).bulkWrite(chunk, { ordered: false })
  }
  await mongoose.disconnect()
}

main().finally(async () => {
  await mongoose.disconnect()
})

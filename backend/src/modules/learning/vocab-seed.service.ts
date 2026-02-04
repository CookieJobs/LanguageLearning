// input: @nestjs/common, @nestjs/mongoose, mongoose, fs, path, ./vocab.schema
// output: VocabSeedService
// pos: 后端/学习模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as fs from 'fs'
import * as path from 'path'
import { VocabWordDocument } from './vocab.schema'

@Injectable()
export class VocabSeedService implements OnModuleInit {
  private seeded = false
  constructor(@InjectModel('VocabWord') private vocabModel: Model<VocabWordDocument>) {}

  async onModuleInit() {
    if (this.seeded) return
    this.seeded = true
    try {
      const readyState = (this.vocabModel as any)?.db?.readyState ?? (this.vocabModel.collection as any)?.conn?.readyState
      if (typeof readyState === 'number' && readyState !== 1) {
        console.warn('Vocab seed skipped: DB not ready')
        return
      }
      const count = await this.vocabModel.countDocuments()
      if (count > 0) return
      const file = path.resolve(__dirname, '../../../../data/vocab/words.json')
      if (!fs.existsSync(file)) {
        console.warn('Vocab seed skipped: words.json not found at', file)
        return
      }
      const raw = fs.readFileSync(file, 'utf-8')
      const items = JSON.parse(raw)
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
        await this.vocabModel.bulkWrite(chunk, { ordered: false })
      }
      console.log(`Vocab seeded: ${ops.length} entries`)
    } catch (e) {
      console.error('Vocab seed failed:', e)
    }
  }
}

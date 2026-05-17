import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as fs from 'fs'
import * as path from 'path'
import { VocabWordDocument } from './vocab.schema'

interface SourceWord {
  word: string
  phonetic: string
  definition: string
  translation: string
  tags: string
  collins: string
  oxford: string
}

interface SeedEntry {
  lemma: string
  headword: string
  pos: string
  cefr: string
  definitionEn: string
  definitionZh: string
  exampleEn: string
  ipa?: string
  levels: string[]
  topics: string[]
}

const TAG_LEVEL_MAP: Record<string, string> = {
  zk: 'Middle',
  gk: 'High',
  cet4: 'CET4',
  cet6: 'CET6',
  ky: 'University',
  ielts: 'University',
  toefl: 'University',
  gre: 'Professional',
}

function inferPos(definition: string, translation: string): string {
  const combined = (definition + ' ' + translation).toLowerCase()
  if (/\bn\.|noun\b/.test(combined)) return 'noun'
  if (/\badv\.|adverb\b/.test(combined)) return 'adv'
  if (/\badj\.|adjective\b/.test(combined)) return 'adj'
  if (/\bv\.|verb\b/.test(combined)) return 'verb'
  if (/\bprep\./.test(combined)) return 'prep'
  if (/\bconj\./.test(combined)) return 'conj'
  if (/\bpron\./.test(combined)) return 'pron'
  return 'noun'
}

function inferCefr(tags: string, collins: string): string {
  const c = parseInt(collins) || 0
  if (c === 5) return 'A1'
  if (c === 4) return 'A2'
  if (c === 3) return 'B1'
  if (tags.includes('zk') || tags.includes('gk')) return 'B1'
  if (c === 2) return 'B2'
  if (tags.includes('cet4') || tags.includes('cet6')) return 'B2'
  if (c === 1) return 'C1'
  return 'A2'
}

function inferLevels(tags: string, collins: string): string[] {
  const levels = new Set<string>()
  const tagList = tags.split(/\s+/).filter(Boolean)

  for (const tag of tagList) {
    const level = TAG_LEVEL_MAP[tag]
    if (level) levels.add(level)
  }

  // Primary: Collins 5 (most frequent), or Collins 4 without advanced exam tags
  const c = parseInt(collins) || 0
  const advancedTags = ['cet6', 'ky', 'ielts', 'toefl', 'gre']
  const hasAdvanced = tagList.some(t => advancedTags.includes(t))
  if (c === 5 || (c === 4 && !hasAdvanced)) {
    levels.add('Primary')
  }

  // Fallback: if no level assigned, use Collins to guess
  if (levels.size === 0) {
    if (c >= 4) levels.add('Primary')
    else if (c >= 2) levels.add('Middle')
    else levels.add('High')
  }

  return Array.from(levels)
}

function cleanDefinition(def: string): string {
  if (!def) return ''
  const lines = def.split('\n')
  return lines[0].replace(/^[a-z]+\.\s*/, '').trim()
}

@Injectable()
export class VocabSeedService implements OnModuleInit {
  private readonly logger = new Logger(VocabSeedService.name)
  private seeded = false

  constructor(@InjectModel('VocabWord') private vocabModel: Model<VocabWordDocument>) {}

  async onModuleInit() {
    if (this.seeded) return
    this.seeded = true

    try {
      const readyState = (this.vocabModel as any)?.db?.readyState ?? (this.vocabModel.collection as any)?.conn?.readyState
      if (typeof readyState === 'number' && readyState !== 1) {
        this.logger.warn('Vocab seed skipped: DB not ready')
        return
      }

      const count = await this.vocabModel.countDocuments()
      if (count > 0) {
        this.logger.log(`Vocab seed skipped: collection already has ${count} documents`)
        return
      }

      const dataDir = this.findDataDir()
      if (!dataDir) {
        this.logger.warn('Vocab seed skipped: data directory not found')
        return
      }

      const sourceFile = path.join(dataDir, 'elementary_vocabulary.json')
      if (!fs.existsSync(sourceFile)) {
        this.logger.warn(`Vocab seed skipped: source file not found at ${sourceFile}`)
        return
      }

      const raw = fs.readFileSync(sourceFile, 'utf-8')
      const sourceData: SourceWord[] = JSON.parse(raw)
      this.logger.log(`Loaded ${sourceData.length} words from source`)

      // Load cached examples
      let exampleCache: Record<string, string> = {}
      const cacheFile = path.join(dataDir, 'elementary_examples.json')
      if (fs.existsSync(cacheFile)) {
        exampleCache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
        this.logger.log(`Loaded ${Object.keys(exampleCache).length} cached examples`)
      }

      const entries: SeedEntry[] = sourceData
        .filter(item => item.word && item.translation)
        .map(item => {
          const pos = inferPos(item.definition, item.translation)
          const cefr = inferCefr(item.tags, item.collins)
          const levels = inferLevels(item.tags, item.collins)
          const exampleEn = exampleCache[item.word] || item.translation

          return {
            lemma: item.word.toLowerCase(),
            headword: item.word,
            pos,
            cefr,
            definitionEn: cleanDefinition(item.definition) || item.translation,
            definitionZh: item.translation,
            exampleEn,
            ipa: item.phonetic || undefined,
            levels,
            topics: [],
          }
        })

      // Deduplicate by lemma+pos, keeping first
      const seen = new Set<string>()
      const unique: SeedEntry[] = []
      for (const e of entries) {
        const key = `${e.lemma}|${e.pos}`
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(e)
        }
      }

      const ops = unique.map(e => ({
        updateOne: {
          filter: { lemma: e.lemma, pos: e.pos },
          update: {
            $setOnInsert: {
              headword: e.headword,
              lemma: e.lemma,
              pos: e.pos,
              cefr: e.cefr,
              definitionEn: e.definitionEn,
              definitionZh: e.definitionZh,
              exampleEn: e.exampleEn,
              ipa: e.ipa,
              levels: e.levels,
              topics: e.topics,
            },
          },
          upsert: true,
        },
      }))

      const batchSize = 500
      for (let i = 0; i < ops.length; i += batchSize) {
        const chunk = ops.slice(i, i + batchSize)
        await this.vocabModel.bulkWrite(chunk, { ordered: false })
      }

      // Log per-level distribution
      const levelCounts: Record<string, number> = {}
      for (const e of unique) {
        for (const l of e.levels) {
          levelCounts[l] = (levelCounts[l] || 0) + 1
        }
      }
      this.logger.log(`Vocab seeded: ${unique.length} unique entries. Per level: ${JSON.stringify(levelCounts)}`)
    } catch (e) {
      this.logger.error('Vocab seed failed:', e)
    }
  }

  private findDataDir(): string | null {
    const candidates = [
      path.join(process.cwd(), 'data/processed'),
      path.join(process.cwd(), '../data/processed'),
      path.resolve(__dirname, '../../../../data/processed'),
    ]
    for (const p of candidates) {
      if (fs.existsSync(p)) return p
    }
    return null
  }
}

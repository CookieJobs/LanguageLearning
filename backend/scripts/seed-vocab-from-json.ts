import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function ensureLevels(levels: string[]) {
  const uniq = Array.from(new Set(levels))
  for (const code of uniq) {
    await prisma.vocabLevel.upsert({ where: { code }, update: {}, create: { code, name: code } })
  }
}

async function ensureTopics(topics: string[]) {
  const uniq = Array.from(new Set(topics))
  for (const code of uniq) {
    await prisma.vocabTopic.upsert({ where: { code }, update: {}, create: { code, name: code } })
  }
}

async function main() {
  const file = path.resolve(__dirname, '../../data/vocab/words.json')
  const raw = fs.readFileSync(file, 'utf-8')
  const items = JSON.parse(raw)

  // gather all levels/topics
  const allLevels = items.flatMap((it: any) => it.levels || [])
  const allTopics = items.flatMap((it: any) => it.topics || [])
  await ensureLevels(allLevels)
  await ensureTopics(allTopics)

  for (const it of items) {
    const word = await prisma.vocabWord.upsert({
      where: { lemma_pos: { lemma: it.lemma, pos: it.pos } },
      update: {
        headword: it.headword,
        cefr: it.cefr,
        freqRank: it.freq_rank ?? it.freqRank,
        definitionEn: it.definition_en ?? it.definitionEn,
        definitionZh: it.definition_zh ?? it.definitionZh,
        exampleEn: it.example_en ?? it.exampleEn,
      },
      create: {
        headword: it.headword,
        lemma: it.lemma,
        pos: it.pos,
        cefr: it.cefr,
        freqRank: it.freq_rank ?? it.freqRank,
        definitionEn: it.definition_en ?? it.definitionEn,
        definitionZh: it.definition_zh ?? it.definitionZh,
        exampleEn: it.example_en ?? it.exampleEn,
      }
    })

    // link levels
    for (const code of (it.levels || [])) {
      const lvl = await prisma.vocabLevel.findUnique({ where: { code } })
      if (lvl) {
        await prisma.vocabWordLevel.upsert({
          where: { wordId_levelId: { wordId: word.id, levelId: lvl.id } },
          update: {},
          create: { wordId: word.id, levelId: lvl.id }
        })
      }
    }
    // link topics
    for (const code of (it.topics || [])) {
      const tp = await prisma.vocabTopic.findUnique({ where: { code } })
      if (tp) {
        await prisma.vocabWordTopic.upsert({
          where: { wordId_topicId: { wordId: word.id, topicId: tp.id } },
          update: {},
          create: { wordId: word.id, topicId: tp.id }
        })
      }
    }
  }
}

main().finally(async ()=>{ await prisma.$disconnect() })

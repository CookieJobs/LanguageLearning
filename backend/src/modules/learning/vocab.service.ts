// input: @nestjs/common, ../../common/prisma.service
// output: VocabService
// pos: 后端/学习模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'

type Level = 'Primary' | 'Middle' | 'High' | 'University' | 'Professional'

function seededRandom(seed: string) { let h = 2166136261 >>> 0; for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) } return () => { h += 0x6D2B79F5; let t = Math.imul(h ^ (h >>> 15), 1 | h); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

const WEIGHTS: Record<Level, Record<'A1'|'A2'|'B1'|'B2'|'C1'|'C2', number>> = {
  Primary: { A1: 0.7, A2: 0.3, B1: 0, B2: 0, C1: 0, C2: 0 },
  Middle: { A1: 0.1, A2: 0.5, B1: 0.4, B2: 0, C1: 0, C2: 0 },
  High: { A1: 0, A2: 0.1, B1: 0.6, B2: 0.3, C1: 0, C2: 0 },
  University: { A1: 0, A2: 0, B1: 0.2, B2: 0.5, C1: 0.3, C2: 0 },
  Professional: { A1: 0, A2: 0, B1: 0, B2: 0.2, C1: 0.6, C2: 0.2 }
}

@Injectable()
export class VocabService {
  constructor(private prisma: PrismaService) {}
  async pickWords(level: Level, exclude: string[] = [], limit = 5, seed?: string) {
    const rng = seededRandom(seed || (Date.now().toString()))
    const excludeLower = new Set(exclude.map(s => s.toLowerCase()))
    const candidates = await this.prisma.vocabWord.findMany({ where: { levels: { some: { level: { code: level } } } }, include: { levels: true } })
    const filtered = candidates.filter(w => !excludeLower.has(w.headword.toLowerCase()))
    const uniq: Record<string, typeof candidates[number]> = {}; for (const w of filtered) { if (!uniq[w.lemma]) uniq[w.lemma] = w }
    const pool = Object.values(uniq)
    const weights = WEIGHTS[level]
    const norm = (s: string): 'A1'|'A2'|'B1'|'B2'|'C1'|'C2' => { const v = (s || 'A1').toUpperCase(); if (v === 'A1' || v === 'A2' || v === 'B1' || v === 'B2' || v === 'C1' || v === 'C2') return v as any; return 'A1' }
    let resultPool = pool
    if (resultPool.length === 0) {
      const anyCandidates = await this.prisma.vocabWord.findMany({ include: { levels: true } })
      const anyFiltered = anyCandidates.filter(w => !excludeLower.has(w.headword.toLowerCase()))
      const uniqAny: Record<string, typeof anyCandidates[number]> = {}; for (const w of anyFiltered) { if (!uniqAny[w.lemma]) uniqAny[w.lemma] = w }
      resultPool = Object.values(uniqAny)
    }
    const scored = resultPool.map(w => ({ w, score: (weights[norm(w.cefr)] || 0) + (1 / Math.max(1, w.freqRank ?? 1)) * 0.1 }))
    scored.sort(() => rng() - 0.5)
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, limit).map(s => s.w)
  }
}

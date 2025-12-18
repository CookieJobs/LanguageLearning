import { Body, Controller, Post, UseGuards, Req, Get, Query } from '@nestjs/common'
import { JwtGuard } from '../../common/jwt.guard'
import { PrismaService } from '../../common/prisma.service'
import { StatsService } from '../stats/stats.service'
import fetch from 'node-fetch'
import { VocabService } from './vocab.service'

function parseJSONFromText(text: string) {
  try { return JSON.parse(text) } catch { }
  const match = text && text.match(/[\[{][\s\S]*[\]}]/)
  if (match) return JSON.parse(match[0])
  throw new Error('No JSON found')
}

import { DeepSeekService } from './deepseek.service'

@Controller('learning')
export class LearningController {
  constructor(private prisma: PrismaService, private vocab: VocabService, private stats: StatsService, private deepseek: DeepSeekService) { }
  @Post('words') @UseGuards(JwtGuard)
  async words(@Body() body: { level: string; exclude?: string[] }) {
    const normalize = (s: string): 'Primary' | 'Middle' | 'High' | 'University' | 'Professional' => {
      const map: Record<string, any> = {
        'Primary School (小学)': 'Primary', 'Junior High School (初中)': 'Middle', 'Senior High School (高中)': 'High', 'University (大学/四六级)': 'University', 'Professional/Study Abroad (雅思/托福/职场)': 'Professional',
        'Primary': 'Primary', 'Middle': 'Middle', 'High': 'High', 'University': 'University', 'Professional': 'Professional'
      }
      return map[s] || 'Primary'
    }
    const levelCode = normalize(body.level)
    const seed = `${levelCode}:${new Date().toISOString().slice(0, 10)}`
    const picked = await this.vocab.pickWords(levelCode, body.exclude || [], 5, seed)
    return picked.map((w: any) => ({ word: w.headword, definition: { English: w.definitionEn, Chinese: w.definitionZh }, partOfSpeech: w.pos, example: w.exampleEn }))
  }
  @Post('evaluate') @UseGuards(JwtGuard)
  async evaluate(@Body() body: { word: any; sentence: string }) {
    return this.deepseek.evaluateSentence(body.word, body.sentence)
  }
  @Post('mastery') @UseGuards(JwtGuard)
  async addMastery(@Body() body: { userId?: string; word: string; definition: string; partOfSpeech: string; example: string; userSentence: string; masteredAt?: string }, @Req() req: any) {
    const userId = req.user.id
    const masteredAt = body.masteredAt ? new Date(body.masteredAt) : new Date()
    await this.prisma.wordMastery.create({ data: { userId, word: body.word, definition: body.definition, partOfSpeech: body.partOfSpeech, example: body.example, userSentence: body.userSentence, masteredAt } })
    await this.stats.checkin(userId, masteredAt)
    return { ok: true }
  }
  @Post('mastery/list') @UseGuards(JwtGuard)
  async listMastery(@Req() req: any) {
    const items = await this.prisma.wordMastery.findMany({ where: { userId: req.user.id }, orderBy: { masteredAt: 'desc' } })
    return items
  }

  @Get('mastery/count') @UseGuards(JwtGuard)
  async countMastery(@Req() req: any, @Query('since') since?: string, @Query('level') level?: string) {
    const where: any = { userId: req.user.id }
    if (since) {
      const d = new Date(since)
      if (!isNaN(d.getTime())) where.masteredAt = { gte: d }
    }
    // If level provided, count only masteries whose word belongs to the given vocab level
    if (level) {
      const lvl = await this.prisma.vocabLevel.findUnique({ where: { code: level } })
      if (!lvl) return { count: 0 }
      const links = await this.prisma.vocabWordLevel.findMany({ where: { levelId: lvl.id }, select: { wordId: true } })
      const wordIds = links.map(l => l.wordId)
      if (wordIds.length === 0) return { count: 0 }
      const words = await this.prisma.vocabWord.findMany({ where: { id: { in: wordIds } }, select: { headword: true } })
      const headwords = words.map(w => w.headword)
      if (headwords.length === 0) return { count: 0 }
      where.word = { in: headwords }
    }
    const count = await this.prisma.wordMastery.count({ where })
    return { count }
  }
}

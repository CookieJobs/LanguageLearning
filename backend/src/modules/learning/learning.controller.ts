// input: @nestjs/common, @nestjs/mongoose, mongoose, ../../common/jwt.guard, ../stats/stats.service, ./vocab.service, ./deepseek.service, ./mastery.schema
// output: LearningController, route:learning
// pos: 后端/学习模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Body, Controller, Post, UseGuards, Req, Get, Query, BadRequestException, Res } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { JwtGuard } from '../../common/jwt.guard'
import { StatsService } from '../stats/stats.service'
import { VocabService } from './vocab.service'
import { WordMasteryDocument } from './mastery.schema'
import { TextbookService } from './textbook.service'
import { ProgressService } from './progress.service'
import fetch from 'node-fetch'
import { Response } from 'express'

import { DeepSeekService } from './deepseek.service'
import { LearningSchedulerService } from './learning-scheduler.service'
import { QuestionGeneratorService } from './question-generator.service'

@Controller('learning')
export class LearningController {
  constructor(
    @InjectModel('WordMastery') private masteryModel: Model<WordMasteryDocument>,
    private vocab: VocabService,
    private stats: StatsService,
    private deepseek: DeepSeekService,
    private textbookService: TextbookService,
    private progressService: ProgressService,
    private scheduler: LearningSchedulerService,
    private questionGenerator: QuestionGeneratorService
  ) { }

  @Get('session') @UseGuards(JwtGuard)
  async getSession(@Req() req: any, @Query('level') level?: string, @Query('textbook') textbook?: string) {
    const userId = req.user.id
    const normalize = (s: string) => {
      const map: Record<string, any> = {
        'Primary School (小学)': 'Primary', 'Junior High School (初中)': 'Middle', 'Senior High School (高中)': 'High', 'CET-4 (四级)': 'CET4', 'CET-6 (六级)': 'CET6'
      }
      return map[s] || s
    }

    // Louis 新学习路径：每次 10 题 = 4 旧词 + 6 新词
    // 旧词：从待复习列表获取（最多4个，stage 1-3）
    const OLD_WORD_COUNT = 4
    const NEW_WORD_COUNT = 6
    const dueItems = await this.scheduler.getDueWords(userId, OLD_WORD_COUNT)
    
    const questions: any[] = []
    const allLearnedWordIds = await this.scheduler.getAllLearnedWordIds(userId)
    
    // 处理旧词：按 stage 匹配题型
    for (const item of dueItems) {
      const word = item.wordId as any
      if (!word) continue

      let q: any
      if (item.stage === 0 || item.stage === 1) {
        // Stage 0-1: 选择题
        const mode = Math.random() > 0.5 ? 'en-zh' : 'zh-en'
        q = await this.questionGenerator.generateChoiceQuestion(word, mode)
      } else if (item.stage === 2) {
        // Stage 2: 填空题 (quiz 类型，用例句挖空)
        q = await this.questionGenerator.generateQuizQuestion(word)
      } else {
        // Stage 3: 用例句的 quiz（sentence 生成器待实现）
        q = await this.questionGenerator.generateQuizQuestion(word)
      }
      
      if (q) {
        q.progressId = String(item._id)
        q.word = {
          word: word.headword,
          definition: word.definitionZh,
          partOfSpeech: word.pos,
          example: word.exampleEn,
          audioUrl: word.audioUrl
        }
        questions.push(q)
      }
    }

    // 填入新词：补充到 10 题
    const neededSlots = Math.max(0, 10 - questions.length)
    if (neededSlots > 0 && level) {
      const levelCode = normalize(level)
      try {
        const newWords = await this.vocab.pickWords(
          levelCode,
          allLearnedWordIds,
          neededSlots,
          Math.random().toString(),
          textbook
        )
        
        for (const word of newWords) {
          const w = word as any
          const mode = Math.random() > 0.5 ? 'en-zh' : 'zh-en'
          const q: any = await this.questionGenerator.generateChoiceQuestion(w, mode)
          q.word = {
            word: w.headword,
            definition: w.definitionZh,
            partOfSpeech: w.pos,
            example: w.exampleEn,
            audioUrl: w.audioUrl
          }
          questions.push(q)
        }
      } catch (e) {
        // ignore VOCAB_EMPTY or others
      }
    }
    
    return { questions }
  }

  @Get('textbooks')
  async listTextbooks(@Query('level') level?: string) {
    const normalize = (s: string): string => {
      const map: Record<string, any> = {
        'Primary School (小学)': 'Primary', 'Junior High School (初中)': 'Middle', 'Senior High School (高中)': 'High', 'CET-4 (四级)': 'CET4', 'CET-6 (六级)': 'CET6'
      }
      return map[s] || s
    }
    const levelCode = level ? normalize(level) : undefined;
    return {
      textbooks: await this.textbookService.listTextbooks(levelCode)
    }
  }

  @Get('progress') @UseGuards(JwtGuard)
  async getProgress(@Req() req: any, @Query('level') level?: string, @Query('textbook') textbook?: string) {
    const normalize = (s: string): string => {
      const map: Record<string, any> = {
        'Primary School (小学)': 'Primary', 'Junior High School (初中)': 'Middle', 'Senior High School (高中)': 'High', 'CET-4 (四级)': 'CET4', 'CET-6 (六级)': 'CET6'
      }
      return map[s] || s
    }
    return this.progressService.getProgress(req.user.id, level ? normalize(level) : undefined, textbook)
  }

  @Get('audio')
  async proxyAudio(@Query('word') word: string, @Res() res: Response) {
    if (!word) throw new BadRequestException('Word is required')

    // Use Youdao TTS (Type 2 = US English)
    const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })

      if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`)

      res.set('Content-Type', 'audio/mpeg')
      res.set('Cache-Control', 'public, max-age=31536000') // Cache for 1 year

      // Pipe the stream
      response.body.pipe(res)
    } catch (e) {
      console.error('Audio proxy error:', e)
      res.status(500).send('Audio fetch failed')
    }
  }

  @Post('words') @UseGuards(JwtGuard)
  async words(@Body() body: { level: string; exclude?: string[]; textbook?: string }) {
    const normalize = (s: string): 'Primary' | 'Middle' | 'High' | 'CET4' | 'CET6' => {
      const map: Record<string, any> = {
        'Primary School (小学)': 'Primary', 'Junior High School (初中)': 'Middle', 'Senior High School (高中)': 'High', 'CET-4 (四级)': 'CET4', 'CET-6 (六级)': 'CET6',
        'Primary': 'Primary', 'Middle': 'Middle', 'High': 'High', 'CET4': 'CET4', 'CET6': 'CET6'
      }
      return map[s] || 'Primary'
    }
    const levelCode = normalize(body.level)
    const seed = `${levelCode}:${new Date().toISOString().slice(0, 10)}`
    try {
      const picked = await this.vocab.pickWords(levelCode, body.exclude || [], 5, seed, body.textbook)
      return picked.map((w: any) => ({
        word: w.headword,
        definition: { English: w.definitionEn, Chinese: w.definitionZh },
        partOfSpeech: w.pos,
        example: w.exampleEn,
        audioUrl: w.audioUrl
      }))
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg === 'VOCAB_EMPTY') throw new BadRequestException('VOCAB_EMPTY')
      if (msg === 'DB_NOT_READY') throw new BadRequestException('DB_NOT_READY')
      throw e
    }
  }

  @Post('submit') @UseGuards(JwtGuard)
  async submit(@Body() body: { wordId: string; isCorrect: boolean; userSentence?: string }, @Req() req: any) {
    if (!body.wordId) throw new BadRequestException('wordId is required')
    return this.scheduler.submitAnswer(req.user.id, body.wordId, body.isCorrect, body.userSentence)
  }

  @Post('evaluate') @UseGuards(JwtGuard)
  async evaluate(@Body() body: { word: any; sentence: string }) {
    return this.deepseek.evaluateSentence(body.word, body.sentence)
  }
  @Post('mastery') @UseGuards(JwtGuard)
  async addMastery(@Body() body: { userId?: string; word: string; definition: string; partOfSpeech: string; example: string; userSentence: string; masteredAt?: string; sourceLevel?: string }, @Req() req: any) {
    const userId = req.user.id
    const masteredAt = body.masteredAt ? new Date(body.masteredAt) : new Date()
    await this.masteryModel.create({
      userId,
      word: body.word,
      definition: body.definition,
      partOfSpeech: body.partOfSpeech,
      example: body.example,
      userSentence: body.userSentence,
      masteredAt,
      sourceLevel: body.sourceLevel
    })
    await this.stats.checkin(userId, masteredAt)
    return { ok: true }
  }
  @Post('mastery/list') @UseGuards(JwtGuard)
  async listMastery(@Req() req: any) {
    const items = await this.masteryModel.find({ userId: req.user.id }).sort({ masteredAt: -1 }).lean()
    return items
  }

  @Get('mastery/count') @UseGuards(JwtGuard)
  async countMastery(@Req() req: any, @Query('since') since?: string, @Query('level') level?: string) {
    const where: any = { userId: req.user.id }
    if (since) {
      const d = new Date(since)
      if (!isNaN(d.getTime())) where.masteredAt = { $gte: d }
    }
    // If level provided, count only masteries whose word belongs to the given vocab level
    if (level) {
      const words = await this.vocab.listHeadwordsByLevel(level)
      if (words.length === 0) return { count: 0 }
      where.word = { $in: words }
    }
    const count = await this.masteryModel.countDocuments(where)
    return { count }
  }
}

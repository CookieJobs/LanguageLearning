import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { VocabWordDocument } from './vocab.schema'
import { WordMasteryDocument } from './mastery.schema'

@Injectable()
export class ProgressService {
    constructor(
        @InjectModel('VocabWord') private vocabModel: Model<VocabWordDocument>,
        @InjectModel('WordMastery') private masteryModel: Model<WordMasteryDocument>
    ) { }

    async getProgress(userId: string, level?: string, textbook?: string) {
        // 1. Fetch relevant vocabulary
        const vocabQuery: any = {}
        if (level) vocabQuery.levels = level
        if (textbook) vocabQuery.textbooks = textbook

        const words = await this.vocabModel.find(vocabQuery).select('headword definitionZh partOfSpeech').lean()
        const wordMap = new Map(words.map(w => [w.headword, w]))

        // 2. Fetch user mastery for these words
        // Optimization: filtering by words might be cleaner if list is small, 
        // but fetching all user mastery is safer if list is large to avoid massive $in query?
        // Let's filter mastery by sourceLevel if provided, or just match words.
        // Given we want to know WHICH words are mastered from the vocab list:
        const specificWords = words.map(w => w.headword)
        const mastery = await this.masteryModel.aggregate([
            { $match: { userId, word: { $in: specificWords } } },
            { $group: { _id: '$word', count: { $sum: 1 }, lastMastered: { $max: '$masteredAt' } } }
        ])

        const masteryMap = new Map(mastery.map(m => [m._id, m]))

        // 3. Merge data
        const list = words.map(w => {
            const m = masteryMap.get(w.headword)
            return {
                word: w.headword,
                definition: w.definitionZh,
                mastered: !!m,
                masteryCount: m?.count || 0,
                lastMastered: m?.lastMastered || null
            }
        })

        return {
            totalCount: words.length,
            masteredCount: mastery.length,
            list
        }
    }
}

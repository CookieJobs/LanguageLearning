import { Injectable } from '@nestjs/common'
import { VocabService } from './vocab.service'
import { VocabWordDocument } from './vocab.schema'

export interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface QuestionPayload {
  wordId: string
  type: 'choice' | 'quiz' | 'spelling'
  questionText: string
  options?: QuestionOption[]
  answer?: string
}

@Injectable()
export class QuestionGeneratorService {
  constructor(
    private vocabService: VocabService
  ) {}

  async generateChoiceQuestion(word: VocabWordDocument, mode: 'en-zh' | 'zh-en'): Promise<QuestionPayload> {
    const distractors = await this.vocabService.getRandomDistractors(3, String(word._id), word.levels?.[0])
    
    let questionText: string
    let correctText: string
    let distractorTextFn: (w: any) => string

    if (mode === 'en-zh') {
      questionText = word.headword
      correctText = word.definitionZh
      distractorTextFn = (w) => w.definitionZh
    } else {
      questionText = word.definitionZh
      correctText = word.headword
      distractorTextFn = (w) => w.headword
    }

    const options: QuestionOption[] = [
      { id: String(word._id), text: correctText, isCorrect: true },
      ...distractors.map(d => ({
        id: String(d._id),
        text: distractorTextFn(d),
        isCorrect: false
      }))
    ]

    // Shuffle options
    options.sort(() => Math.random() - 0.5)

    return {
      wordId: String(word._id),
      type: 'choice',
      questionText,
      options
    }
  }

  async generateQuizQuestion(word: VocabWordDocument): Promise<QuestionPayload> {
    // Context-based question using example sentence if available
    if (word.exampleEn) {
       // Hide the word in the example sentence
       // Simple regex replacement of the headword (case insensitive)
       const escaped = word.headword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
       const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
       
       // If the word is not found in example (sometimes happens due to lemma/form diff), fallback
       if (!regex.test(word.exampleEn)) {
          return this.generateChoiceQuestion(word, 'zh-en')
       }

       const questionText = word.exampleEn.replace(regex, '______')
       
       // Distractors: other words from same level
       const distractors = await this.vocabService.getRandomDistractors(3, String(word._id), word.levels?.[0])
       
       const options: QuestionOption[] = [
          { id: String(word._id), text: word.headword, isCorrect: true },
          ...distractors.map(d => ({
            id: String(d._id),
            text: d.headword,
            isCorrect: false
          }))
       ]
       options.sort(() => Math.random() - 0.5)

       return {
         wordId: String(word._id),
         type: 'quiz',
         questionText: `${questionText}`,
         options
       }
    }

    // Fallback to choice if no example
    return this.generateChoiceQuestion(word, 'zh-en')
  }
}

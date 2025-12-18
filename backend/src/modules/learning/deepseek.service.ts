import { Injectable } from '@nestjs/common'
import fetch from 'node-fetch'

@Injectable()
export class DeepSeekService {
  private get apiKey() { return process.env.DEEPSEEK_API_KEY }
  private get model() { return process.env.DEEPSEEK_MODEL || 'deepseek-chat' }

  async evaluateSentence(word: any, sentence: string) {
    if (!this.apiKey) {
      const w = String(word?.word || '').toLowerCase()
      const sent = String(sentence || '').toLowerCase()
      const ok = w && sent.includes(w)
      return ok
        ? { isCorrect: true, feedback: '句子使用了目标词，继续保持！' }
        : { isCorrect: false, feedback: '句子未包含目标词或形式不正确，请尝试包含该词。' }
    }

    const messages = [
      { role: 'system', content: 'You write feedback in Simplified Chinese. Output strict JSON only. improvedSentence must be ENGLISH if present.' },
      { role: 'user', content: `Word: "${word.word}" (${word.partOfSpeech}, meaning: ${word.definition}). Sentence: "${sentence}". Return {isCorrect:boolean, feedback:string, improvedSentence?:string}.` }
    ]

    const res = await this.callApi(messages)
    return this.parseJSON(res)
  }

  async generateStory(words: string[]) {
    if (!this.apiKey) {
      return {
        story: `[Local Mode] Once upon a time, there were some words: ${words.join(', ')}. They lived happily ever after. (Please configure DEEPSEEK_API_KEY for real stories)`,
        translation: `[本地模式] 很久以前，有几个单词：${words.join(', ')}。它们从此过上了幸福的生活。（请配置 DEEPSEEK_API_KEY 以获取真实故事）`
      }
    }

    const messages = [
      {
        role: 'system',
        content: `You are a creative writer for primary school students in China. 
        1. Write a funny, short story (max 100 words) using the provided words.
        2. **CRITICAL**: Apart from the provided target words, ALL other vocabulary MUST be simple enough for a Chinese primary school student (Mainland China curriculum). Keep sentences simple.
        3. Wrap the target words in **asterisks** (e.g. **apple**) when they appear.
        4. Provide a natural Chinese translation.
        5. Output STRICT JSON format ONLY. Do not use markdown blocks.
        
        Example Output:
        {
          "story": "The **cat** sat on the **mat**.",
          "translation": "这只**猫**坐在**垫子**上。"
        }`
      },
      { role: 'user', content: `Words: ${words.join(', ')}` }
    ]

    const content = await this.callApi(messages)
    return this.parseJSON(content)
  }

  private async callApi(messages: any[]) {
    try {
      console.log('DeepSeek Call with key:', this.apiKey ? '***' : 'MISSING')
      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7
        })
      })
      if (!res.ok) {
        const errText = await res.text()
        console.error('DeepSeek API Error:', res.status, errText)
        throw new Error(`DeepSeek API Failed: ${res.status} ${errText}`)
      }
      const data = (await res.json()) as any
      return data?.choices?.[0]?.message?.content || ''
    } catch (e) {
      console.error('DeepSeekService Call Failed:', e)
      throw e
    }
  }

  private parseJSON(text: string) {
    try { return JSON.parse(text) } catch { }
    const match = text && text.match(/[\[{][\s\S]*[\]}]/)
    if (match) return JSON.parse(match[0])
    throw new Error('No JSON found in response')
  }
}

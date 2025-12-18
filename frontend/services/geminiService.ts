import { EducationLevel, WordItem, FeedbackResponse } from "../types";
import { forceLogout } from "./authGuard";

const base = "/api/learning";

function authHeaders() {
  const token = localStorage.getItem('linguaCraft_token')
  const h: Record<string, string> = { "Content-Type": "application/json" }
  if (token) h["Authorization"] = `Bearer ${token}`
  return h
}

function normalizeLevelCode(level: EducationLevel): string {
  const map: Record<string, string> = {
    'Primary School (小学)': 'Primary',
    'Junior High School (初中)': 'Middle',
    'Senior High School (高中)': 'High',
    'University (大学/四六级)': 'University',
    'Professional/Study Abroad (雅思/托福/职场)': 'Professional'
  };
  return map[level] || level;
}

export const fetchWordsForLevel = async (level: EducationLevel, existingWords: string[] = []): Promise<WordItem[]> => {
  const res = await fetch(`${base}/words`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ level: normalizeLevelCode(level), exclude: existingWords })
  })
  if (res.status === 401) { forceLogout(); throw new Error("unauthorized") }
  if (!res.ok) throw new Error("Failed to fetch words")
  const data = await res.json()
  const normalize = (items: any[]): WordItem[] => items.map((it: any) => {
    let def = it.definition
    if (def && typeof def === 'object') {
      const eng = def.English || def.english || ''
      const zh = def.Chinese || def.chinese || ''
      def = zh ? `${eng} (${zh})` : String(eng || '')
    }
    return {
      word: String(it.word || ''),
      definition: String(def || ''),
      partOfSpeech: String(it.partOfSpeech || ''),
      example: String(it.example || '')
    }
  })
  return Array.isArray(data) ? normalize(data) : normalize([])
};

export const evaluateSentence = async (word: WordItem, sentence: string): Promise<FeedbackResponse> => {
  const res = await fetch(`${base}/evaluate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ word, sentence })
  })
  if (res.status === 401) { forceLogout(); return { isCorrect: false, feedback: "未登录或登录已过期" } }
  if (!res.ok) return { isCorrect: false, feedback: "抱歉，暂时无法验证您的句子，请稍后再试。" }
  return await res.json()
};

export const addMastery = async (word: WordItem, userSentence: string, masteredAt?: string): Promise<{ ok: boolean }> => {
  const res = await fetch(`/api/learning/mastery`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      word: word.word,
      definition: word.definition,
      partOfSpeech: word.partOfSpeech,
      example: word.example,
      userSentence,
      masteredAt
    })
  })
  if (res.status === 401) { forceLogout(); return { ok: false } }
  return await res.json()
}

export const fetchMasteryList = async (): Promise<any[]> => {
  const res = await fetch(`/api/learning/mastery/list`, {
    method: "POST",
    headers: authHeaders()
  })
  if (res.status === 401) { forceLogout(); return [] }
  return await res.json()
}

export const logout = async (): Promise<{ ok: boolean }> => {
  const res = await fetch(`/api/auth/logout`, {
    method: "POST",
    headers: authHeaders()
  })
  if (res.status === 401) { forceLogout(); return { ok: true } }
  return await res.json()
}

export const getMe = async (): Promise<{ id: string; email: string; educationLevel?: string | null }> => {
  const res = await fetch(`/api/me`, {
    method: "GET",
    headers: authHeaders()
  })
  if (res.status === 401) { forceLogout(); throw new Error("unauthorized") }
  return await res.json()
}

export const getStats = async (): Promise<{ currentStreak: number; longestStreak: number; lastActivityDate?: string | null }> => {
  const res = await fetch(`/api/stats/me`, { method: "GET", headers: authHeaders() })
  if (res.status === 401) { forceLogout(); throw new Error("unauthorized") }
  return await res.json()
}

export const checkin = async (date?: string): Promise<{ currentStreak: number; longestStreak: number; lastActivityDate?: string | null }> => {
  const res = await fetch(`/api/stats/checkin`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(date ? { date } : {})
  })
  if (res.status === 401) { forceLogout(); throw new Error("unauthorized") }
  return await res.json()
}

export const getMasteryCount = async (opts?: { since?: string; level?: string }): Promise<{ count: number }> => {
  const params: string[] = []
  if (opts?.since) params.push(`since=${encodeURIComponent(opts.since)}`)
  if (opts?.level) params.push(`level=${encodeURIComponent(opts.level)}`)
  const url = params.length ? `/api/learning/mastery/count?${params.join('&')}` : `/api/learning/mastery/count`
  const res = await fetch(url, { method: "GET", headers: authHeaders() })
  if (res.status === 401) { forceLogout(); throw new Error("unauthorized") }
  return await res.json()
}

export const updateMe = async (payload: { educationLevel?: string; name?: string; avatarUrl?: string }): Promise<{ ok: boolean }> => {
  const res = await fetch(`/api/me`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(payload) })
  if (res.status === 401) { forceLogout(); throw new Error("unauthorized") }
  return await res.json()
}

export const generateStory = async (words: string[]): Promise<{ story: string; translation: string }> => {
  const res = await fetch(`/api/story/generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ words })
  })
  if (res.status === 401) { forceLogout(); throw new Error("unauthorized") }
  if (!res.ok) throw new Error("Failed to generate story")
  return await res.json()
}

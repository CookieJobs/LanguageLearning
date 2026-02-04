// input: ../types, ./apiClient, ./config
// output: fetchWordsForLevel, evaluateSentence, addMastery, fetchMasteryList, logout, getMe, getStats, checkin, getMasteryCount, updateMe, generateStory
// pos: 前端/服务层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { EducationLevel, WordItem, FeedbackResponse, ProgressStats } from "../types";
import { apiFetch } from "./apiClient";
import { API_BASE } from "./config";

const base = `${API_BASE}/api/learning`;

function toApiError(status: number, data: any) {
  const code = String(data?.message || data?.error || '').trim() || `HTTP_${status}`
  const err: any = new Error(code)
  err.code = code
  err.status = status
  return err
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

export const fetchWordsForLevel = async (level: EducationLevel, existingWords: string[] = [], textbook?: string): Promise<WordItem[]> => {
  const res = await apiFetch(`${base}/words`, {
    method: "POST",
    body: JSON.stringify({ level: normalizeLevelCode(level), exclude: existingWords, textbook })
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw toApiError(res.status, data)
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
  try {
    const res = await apiFetch(`${base}/evaluate`, {
      method: "POST",
      body: JSON.stringify({ word, sentence })
    })
    if (!res.ok) return { isCorrect: false, feedback: "抱歉，暂时无法验证您的句子，请稍后再试。" }
    return await res.json()
  } catch (e: any) {
    if (e.message === 'unauthorized') return { isCorrect: false, feedback: "未登录或登录已过期" }
    throw e
  }
};

export const addMastery = async (word: WordItem, userSentence: string, masteredAt?: string, sourceLevel?: string): Promise<{ ok: boolean }> => {
  try {
    const res = await apiFetch(`${API_BASE}/api/learning/mastery`, {
      method: "POST",
      body: JSON.stringify({
        word: word.word,
        definition: word.definition,
        partOfSpeech: word.partOfSpeech,
        example: word.example,
        userSentence,
        masteredAt,
        sourceLevel
      })
    })
    return await res.json()
  } catch (e: any) {
    if (e.message === 'unauthorized') return { ok: false }
    throw e
  }
}

export const fetchMasteryList = async (): Promise<any[]> => {
  try {
    const res = await apiFetch(`${API_BASE}/api/learning/mastery/list`, {
      method: "POST"
    })
    return await res.json()
  } catch (e: any) {
    if (e.message === 'unauthorized') return []
    throw e
  }
}

export const logout = async (): Promise<{ ok: boolean }> => {
  try {
    const res = await apiFetch(`${API_BASE}/api/auth/logout`, {
      method: "POST"
    })
    return await res.json()
  } catch (e: any) {
    if (e.message === 'unauthorized') return { ok: true }
    throw e
  }
}

export const getMe = async (): Promise<{ id: string; email: string; educationLevel?: string | null; textbook?: string | null }> => {
  const res = await apiFetch(`${API_BASE}/api/me`, {
    method: "GET"
  })
  return await res.json()
}

export const getStats = async (): Promise<{ currentStreak: number; longestStreak: number; lastActivityDate?: string | null }> => {
  const res = await apiFetch(`${API_BASE}/api/stats/me`, { method: "GET" })
  return await res.json()
}

export const checkin = async (date?: string): Promise<{ currentStreak: number; longestStreak: number; lastActivityDate?: string | null }> => {
  const res = await apiFetch(`${API_BASE}/api/stats/checkin`, {
    method: "POST",
    body: JSON.stringify(date ? { date } : {})
  })
  return await res.json()
}

export const getMasteryCount = async (opts?: { since?: string; level?: string }): Promise<{ count: number }> => {
  const params: string[] = []
  if (opts?.since) params.push(`since=${encodeURIComponent(opts.since)}`)
  if (opts?.level) params.push(`level=${encodeURIComponent(opts.level)}`)
  const url = params.length ? `${API_BASE}/api/learning/mastery/count?${params.join('&')}` : `${API_BASE}/api/learning/mastery/count`
  const res = await apiFetch(url, { method: "GET" })
  return await res.json()
}

export const updateMe = async (payload: { educationLevel?: string; name?: string; avatarUrl?: string; textbook?: string }): Promise<{ ok: boolean }> => {
  const res = await apiFetch(`${API_BASE}/api/me`, { method: "PATCH", body: JSON.stringify(payload) })
  return await res.json()
}

export const generateStory = async (words: string[]): Promise<{ story: string; translation: string }> => {
  const res = await apiFetch(`${API_BASE}/api/story/generate`, {
    method: "POST",
    body: JSON.stringify({ words })
  })
  if (!res.ok) throw new Error("Failed to generate story")
  return await res.json()
}

export const fetchTextbooks = async (): Promise<string[]> => {
  const res = await apiFetch(`${base}/textbooks`, { method: "GET" })
  const data = await res.json()
  return data.textbooks || []
}

export const fetchProgress = async (level?: string, textbook?: string): Promise<ProgressStats> => {
  const params: string[] = []
  if (level) params.push(`level=${encodeURIComponent(level)}`)
  if (textbook) params.push(`textbook=${encodeURIComponent(textbook)}`)
  const url = params.length ? `${base}/progress?${params.join('&')}` : `${base}/progress`
  const res = await apiFetch(url, { method: "GET" })
  return await res.json()
}

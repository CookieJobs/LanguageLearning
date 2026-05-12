// input: ./apiClient, ./config
// output: fetchAdminDashboard, fetchAdminUsers, fetchAdminUserDetail, setAdminRole
// pos: 前端/服务层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { apiFetch } from './apiClient'
import { API_BASE } from './config'

export interface AdminDashboard {
  totalUsers: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  usersByLevel: Record<string, number>
  totalVocabWords: number
  totalMasteredRecords: number
  usersLearning: number
  usersMastered: number
  activeToday: number
  activeThisWeek: number
  activeThisMonth: number
  stageDistribution: Record<string, number>
  avgStreak: number
  longestStreak: number
  topUsers: { userId: string; totalMastered: number; currentStreak: number }[]
}

export interface AdminUser {
  id: string
  email: string
  isAdmin: boolean
  createdAt: string
  educationLevel: string
  textbook: string | null
  wordsTotal: number
  wordsStage0: number
  wordsStage1: number
  wordsStage2: number
  wordsStage3: number
  totalMastered: number
  currentStreak: number
  longestStreak: number
  lastActive: string | null
}

export interface AdminUserDetail {
  id: string
  email: string
  isAdmin: boolean
  createdAt: string
  educationLevel: string
  textbook: string | null
  currentStreak: number
  longestStreak: number
  totalMastered: number
  lastActive: string | null
  activeDays: number
  masteredList: { word: string; definition: string; partOfSpeech: string; masteredAt: string }[]
  words: {
    wordId: string
    word: string
    definition: string
    stage: number
    correctCount: number
    wrongCount: number
    consecutiveCorrect: number
    exposureCount: number
    lastPracticedAt: string
    nextReviewAt: string
  }[]
}

const base = `${API_BASE}/api/admin`

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  const res = await apiFetch(`${base}/dashboard`)
  return res.json()
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await apiFetch(`${base}/users`)
  return res.json()
}

export async function fetchAdminUserDetail(id: string): Promise<AdminUserDetail> {
  const res = await apiFetch(`${base}/users/${encodeURIComponent(id)}`)
  return res.json()
}

export async function setAdminRole(id: string, isAdmin: boolean): Promise<void> {
  await apiFetch(`${base}/users/${encodeURIComponent(id)}/role`, {
    method: 'PUT',
    body: JSON.stringify({ isAdmin })
  })
}

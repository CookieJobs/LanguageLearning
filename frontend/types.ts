// input: 无
// output: 无
// pos: 系统/通用
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
export enum EducationLevel {
  PRIMARY = 'Primary School (小学)',
  MIDDLE = 'Junior High School (初中)',
  HIGH = 'Senior High School (高中)',
  UNIVERSITY = 'University (大学/四六级)',
  PROFESSIONAL = 'Professional/Study Abroad (雅思/托福/职场)'
}

export interface WordItem {
  word: string;
  definition: string;
  partOfSpeech: string;
  example: string;
  audioUrl?: string;
}

export interface MasteredItem extends WordItem {
  userSentence: string;
  masteredAt: string;
  sourceLevel?: EducationLevel;
}

export interface FeedbackResponse {
  isCorrect: boolean;
  feedback: string;
  improvedSentence?: string;
}

export interface ProgressStats {
  totalCount: number;
  masteredCount: number;
  mastered: number;
  learning: number;
  new: number;
  toReview: number;
  struggling: number;
  list: {
    word: string;
    definition: string;
    mastered: boolean;
    learning: boolean;
    toReview: boolean;
    struggling: boolean;
    masteryCount: number;
    lastMastered: string | null;
    stage: number;
    wrongCount: number;
    nextReviewAt: string | null;
  }[];
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean; // Optional, might be hidden in some implementations
}

export type QuestionType = 'choice' | 'quiz' | 'sentence';

export interface Question {
  wordId: string;
  type: QuestionType;
  questionText: string;
  options?: QuestionOption[];
  answer?: string;
  progressId?: string;
  word: WordItem; // Context word
}

export type Screen = 'onboarding' | 'learning' | 'review';

export interface Pet {
  _id: string;
  userId: string;
  name: string;
  level: number;
  exp: number;
  hunger: number;
  energy: number;
  appearance: {
    type: string;
    color: string;
    [key: string]: any;
  };
  lastInteractedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletTransaction {
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Wallet {
  _id: string;
  userId: string;
  balance: number;
  transactions: WalletTransaction[];
  createdAt?: string;
  updatedAt?: string;
}

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
  list: {
    word: string;
    definition: string;
    mastered: boolean;
    masteryCount: number;
    lastMastered: string | null;
  }[];
}

export type Screen = 'onboarding' | 'learning' | 'review';

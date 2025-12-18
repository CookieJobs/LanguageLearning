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
}

export interface MasteredItem extends WordItem {
  userSentence: string;
  masteredAt: string;
}

export interface FeedbackResponse {
  isCorrect: boolean;
  feedback: string;
  improvedSentence?: string;
}

export type Screen = 'onboarding' | 'learning' | 'review';

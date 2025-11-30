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
  example: string; // Used as a hidden reference or hint
}

export interface MasteredItem extends WordItem {
  userSentence: string;
  masteredAt: string; // ISO Date string
}

export interface FeedbackResponse {
  isCorrect: boolean;
  feedback: string;
  improvedSentence?: string; // Optional suggestion if the user is close but needs polish, or if correct
}

export type Screen = 'onboarding' | 'learning' | 'review';
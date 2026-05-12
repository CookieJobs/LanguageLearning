export interface WordItem {
  id: string;
  word: string;
  mastered: boolean;
  definition: string; // Used as translation
  phonetic?: string;
  pos?: string;
  example?: string;
  // Learning data for Task 4
  firstLearnTime?: string;
  reviewCount?: number;
}

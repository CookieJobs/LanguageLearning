import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EducationLevel, WordItem, FeedbackResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for generating a list of words
const wordListSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING },
      definition: { type: Type.STRING },
      partOfSpeech: { type: Type.STRING },
      example: { type: Type.STRING },
    },
    required: ["word", "definition", "partOfSpeech", "example"],
  },
};

// Schema for checking a sentence
const feedbackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isCorrect: { type: Type.BOOLEAN },
    feedback: { type: Type.STRING },
    improvedSentence: { type: Type.STRING },
  },
  required: ["isCorrect", "feedback"],
};

export const fetchWordsForLevel = async (level: EducationLevel, existingWords: string[] = []): Promise<WordItem[]> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
    Generate a list of 5 distinct, useful English vocabulary words suitable for a student in Mainland China at the "${level}" level. 
    Ensure the words are not in this exclusion list: ${JSON.stringify(existingWords)}.
    The words should be challenging enough to learn but appropriate for the level.
    For the 'example' field, provide a simple sentence using the word.
    For the 'definition' field, provide the English definition followed by the Chinese meaning in parentheses. Example: "To run fast (跑，奔跑)".
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: wordListSchema,
        temperature: 0.7,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as WordItem[];
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error fetching words:", error);
    throw error;
  }
};

export const evaluateSentence = async (word: WordItem, sentence: string): Promise<FeedbackResponse> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
    The user is a Chinese student learning the English word: "${word.word}" (${word.partOfSpeech}, meaning: ${word.definition}).
    The user wrote this sentence using the word: "${sentence}".
    
    Task:
    1. Determine if the sentence uses the word correctly (context, grammar, spelling).
    2. If it is correct and natural: set isCorrect to true. Provide positive feedback in Simplified Chinese (简体中文). You may suggest a slightly more native phrasing in 'improvedSentence' if applicable.
    3. If it is incorrect: set isCorrect to false. 
       - Explain the specific error (grammar, wrong meaning, unnatural collocation) in Simplified Chinese (简体中文).
       - Do NOT give the full answer immediately. Guide the user to fix it themselves.
       - Use the 'feedback' field to speak directly to the user encouragingly (e.g., "尝试得很棒，但是...").
    
    Return JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: feedbackSchema,
        temperature: 0.4, // Lower temperature for more analytical feedback
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as FeedbackResponse;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error evaluating sentence:", error);
    return {
      isCorrect: false,
      feedback: "抱歉，暂时无法验证您的句子，请稍后再试。",
    };
  }
};
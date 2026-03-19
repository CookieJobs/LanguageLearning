import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import { VocabWordSchema } from '../src/modules/learning/vocab.schema';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DATA_DIR = path.resolve(__dirname, '../../data/processed');
const SOURCE_FILE = path.join(DATA_DIR, 'elementary_vocabulary.json');
const CACHE_FILE = path.join(DATA_DIR, 'elementary_examples.json');
const REPORT_FILE = path.join(DATA_DIR, 'import_report.log');

// Constants
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/linguacraft';

// Interfaces
interface SourceWord {
  word: string;
  phonetic: string;
  definition: string;
  translation: string;
  tags: string;
  collins: string;
  oxford: string;
}

interface EnrichedWord {
  headword: string;
  lemma: string;
  pos: string;
  cefr: string;
  definitionEn: string;
  definitionZh: string;
  exampleEn: string;
  ipa: string;
  levels: string[];
  source: string;
  tags: string; // Keep original tags for reference
}

// Logger
const log = (msg: string) => {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  fs.appendFileSync(REPORT_FILE, line + '\n');
};

// DeepSeek API
async function generateExample(word: string, pos: string, definition: string): Promise<string | null> {
  if (!DEEPSEEK_API_KEY) return null;

  const messages = [
    {
      role: 'system',
      content: `You are an English teacher for primary school students. 
      Generate ONE simple English example sentence for the target word.
      The sentence must be suitable for CEFR A1/A2 level.
      Output ONLY the sentence. No quotes, no extra text.`
    },
    {
      role: 'user',
      content: `Word: "${word}" (${pos})
      Definition: ${definition}
      Generate one simple example sentence.`
    }
  ];

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 60
      })
    });

    if (!res.ok) {
      log(`API Error for ${word}: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = (await res.json()) as any;
    const sentence = data?.choices?.[0]?.message?.content?.trim();
    return sentence || null;
  } catch (e) {
    log(`API Exception for ${word}: ${e}`);
    return null;
  }
}

// Helpers
export function inferPos(def: string, trans: string): string {
  const combined = (def + ' ' + trans).toLowerCase();
  
  // Use regex with word boundaries to avoid partial matches (e.g. 'adverb' containing 'verb')
  if (/\bn\.|noun\b/.test(combined)) return 'noun';
  if (/\badv\.|adverb\b/.test(combined)) return 'adv';
  if (/\badj\.|adjective\b/.test(combined)) return 'adj';
  if (/\bv\.|verb\b/.test(combined)) return 'verb';
  if (/\bprep\./.test(combined)) return 'prep';
  if (/\bconj\./.test(combined)) return 'conj';
  if (/\bpron\./.test(combined)) return 'pron';
  
  return 'noun'; // Default
}

export function inferCefr(tags: string, collins: string): string {
  if (tags.includes('zk') || tags.includes('gk')) return 'A2'; // 中考/高考 -> A2/B1, conservative A2
  if (collins === '5') return 'A1';
  if (collins === '4') return 'A1';
  if (collins === '3') return 'A2';
  return 'A1'; // Default for elementary
}

export function getDefinitionEn(def: string): string {
  // ECDICT definition usually has "n. english def\n..."
  // We try to clean it up or take the first line
  if (!def) return '';
  const lines = def.split('\n');
  // Remove pos prefix if present (e.g. "n. ")
  return lines[0].replace(/^[a-z]+\.\s*/, '');
}

async function main() {
  log('Starting Import Process...');

  // 1. Read Source Data
  if (!fs.existsSync(SOURCE_FILE)) {
    log(`Error: Source file not found at ${SOURCE_FILE}`);
    process.exit(1);
  }
  const sourceData: SourceWord[] = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
  log(`Loaded ${sourceData.length} words from source.`);

  // 2. Load Cache
  let cache: Record<string, string> = {};
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    log(`Loaded ${Object.keys(cache).length} cached examples.`);
  }

  // 3. Connect DB
  await mongoose.connect(MONGO_URL);
  const VocabWord = mongoose.model('VocabWord', VocabWordSchema);
  log('Connected to MongoDB.');

  // 4. Process Words
  let processedCount = 0;
  let successCount = 0;
  let apiCalls = 0;
  const batchSize = 50; // Process in chunks to save cache periodically

  // Use IMPORT_LIMIT env var to limit processing (useful for testing)
  const LIMIT = process.env.IMPORT_LIMIT ? parseInt(process.env.IMPORT_LIMIT) : sourceData.length;
  
  if (LIMIT < sourceData.length) {
    log(`[INFO] Processing limited to first ${LIMIT} words.`);
  }

  for (let i = 0; i < LIMIT; i++) {
    const item = sourceData[i];
    const word = item.word;
    
    // Skip if word is empty or invalid
    if (!word || !item.translation) {
      log(`Skipping invalid item: ${JSON.stringify(item)}`);
      continue;
    }

    // Determine example
    let example = cache[word];
    if (!example) {
      // Need AI generation
      // Rate limit check or just proceed (DeepSeek has rate limits)
      // Simple delay to be safe
      if (apiCalls > 0 && apiCalls % 10 === 0) {
        await new Promise(r => setTimeout(r, 1000));
      }
      
      log(`Generating example for: ${word}`);
      const gen = await generateExample(word, inferPos(item.definition, item.translation), item.definition);
      if (gen) {
        example = gen;
        cache[word] = gen;
        apiCalls++;
      } else {
        log(`Failed to generate example for ${word}. Using placeholder.`);
        example = `This is a ${word}.`; // Placeholder to satisfy schema
      }
    }

    // Transform
    const enriched: EnrichedWord = {
      headword: item.word,
      lemma: item.word, // Assuming lemma same as word for simplicity in elementary
      pos: inferPos(item.definition, item.translation),
      cefr: inferCefr(item.tags, item.collins),
      definitionEn: getDefinitionEn(item.definition) || item.word,
      definitionZh: item.translation,
      exampleEn: example,
      ipa: item.phonetic,
      levels: ['Primary'],
      source: 'ecdict-elementary',
      tags: item.tags
    };

    // DB Upsert
    try {
      await VocabWord.updateOne(
        { lemma: enriched.lemma, pos: enriched.pos },
        { $set: enriched },
        { upsert: true }
      );
      successCount++;
    } catch (e) {
      log(`DB Error for ${word}: ${e}`);
    }

    processedCount++;

    // Save cache periodically
    if (processedCount % batchSize === 0) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
      log(`Progress: ${processedCount}/${sourceData.length}. Cache saved.`);
    }
  }

  // Final cache save
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  
  log('-----------------------------------');
  log(`Import Completed.`);
  log(`Total Processed: ${processedCount}`);
  log(`Successfully Upserted: ${successCount}`);
  log(`New AI Examples Generated: ${apiCalls}`);
  log('-----------------------------------');

  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}

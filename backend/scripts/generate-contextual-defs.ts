
import mongoose from 'mongoose';
import { VocabWordSchema } from '../src/modules/learning/vocab.schema';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import OpenAI from 'openai';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY) {
    console.error('DEEPSEEK_API_KEY is not set in .env');
    process.exit(1);
}

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: DEEPSEEK_API_KEY
});

// MongoDB Setup
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/linguacraft';
const VocabWord = mongoose.model('VocabWord', VocabWordSchema);

// Configuration
const BATCH_SIZE = 10; // Number of words to process in one API call
const CACHE_FILE = path.resolve(__dirname, '../../data/processed/contextual_defs_cache.json');
const TEXTBOOKS_FILE = path.resolve(__dirname, '../../data/processed/primary_textbooks.json');

// Cache structure: { textbookName: { word: { definitionZh, exampleEn } } }
let cache: Record<string, Record<string, { definitionZh: string, exampleEn: string }>> = {};

function loadCache() {
    if (fs.existsSync(CACHE_FILE)) {
        try {
            cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        } catch (e) {
            console.error('Failed to load cache, starting fresh.');
        }
    }
}

function saveCache() {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function generateDefinitions(textbook: string, words: string[]): Promise<any[]> {
    if (words.length === 0) return [];

    const prompt = `
You are an expert English teacher for Chinese primary school students.
I will provide a list of English words from the textbook "${textbook}".
For each word, please provide:
1. A simplified Chinese definition (definitionZh) suitable for this grade level.
2. A simple English example sentence (exampleEn) using the word, suitable for this grade level.

Return ONLY a JSON array with objects containing "word", "definitionZh", and "exampleEn".
Do not include any markdown formatting or extra text.

Words: ${words.join(', ')}
    `.trim();

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "deepseek-chat",
            temperature: 0.2
        });

        const content = completion.choices[0].message.content || '[]';
        // Remove markdown code blocks if present
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        return JSON.parse(cleanContent);
    } catch (error) {
        console.error(`Error generating definitions for batch in ${textbook}:`, error);
        return [];
    }
}

async function processTextbook(textbook: string) {
    console.log(`Processing textbook: ${textbook}`);
    
    // 1. Find words in this textbook
    const wordsDocs = await VocabWord.find({ textbooks: textbook }).select('headword contextualDefinitions');
    if (wordsDocs.length === 0) {
        console.log(`No words found for ${textbook}. Skipping.`);
        return;
    }

    console.log(`Found ${wordsDocs.length} words.`);

    // 2. Filter words that need processing
    const wordsToProcess: string[] = [];
    
    // Initialize cache for this textbook
    if (!cache[textbook]) cache[textbook] = {};

    for (const doc of wordsDocs) {
        const word = doc.headword;
        
        // Check DB
        const hasInDb = doc.contextualDefinitions?.some(cd => cd.textbook === textbook);
        
        // Check Cache
        const hasInCache = !!cache[textbook][word];

        if (!hasInDb && !hasInCache) {
            wordsToProcess.push(word);
        } else if (hasInCache && !hasInDb) {
            // If in cache but not in DB, we'll need to update DB later
        }
    }

    console.log(`${wordsToProcess.length} words need AI generation.`);

    // 3. Process in batches
    for (let i = 0; i < wordsToProcess.length; i += BATCH_SIZE) {
        const batch = wordsToProcess.slice(i, i + BATCH_SIZE);
        console.log(`Generating batch ${i / BATCH_SIZE + 1}/${Math.ceil(wordsToProcess.length / BATCH_SIZE)}: ${batch.join(', ')}`);
        
        const results = await generateDefinitions(textbook, batch);
        
        // Update cache
        for (const res of results) {
            if (res.word && res.definitionZh && res.exampleEn) {
                // Find original word case-insensitively if needed, but here we assume exact match or close enough
                // The AI might change casing. Let's try to match back to batch.
                const originalWord = batch.find(w => w.toLowerCase() === res.word.toLowerCase());
                if (originalWord) {
                    cache[textbook][originalWord] = {
                        definitionZh: res.definitionZh,
                        exampleEn: res.exampleEn
                    };
                }
            }
        }
        
        saveCache();
        
        // Sleep to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 4. Sync Cache to DB
    console.log('Syncing cache to database...');
    let updatedCount = 0;
    
    for (const doc of wordsDocs) {
        const word = doc.headword;
        const cachedData = cache[textbook][word];
        
        if (cachedData) {
            // Check if already in DB
            const exists = doc.contextualDefinitions?.some(cd => cd.textbook === textbook);
            if (!exists) {
                await VocabWord.updateOne(
                    { _id: doc._id },
                    { 
                        $push: { 
                            contextualDefinitions: {
                                textbook: textbook,
                                definitionZh: cachedData.definitionZh,
                                exampleEn: cachedData.exampleEn
                            }
                        }
                    }
                );
                updatedCount++;
            }
        }
    }
    
    console.log(`Updated ${updatedCount} words in DB for ${textbook}.`);
}

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Connected to MongoDB.');
        loadCache();

        // 加载教材列表
        if (!fs.existsSync(TEXTBOOKS_FILE)) {
            throw new Error(`Textbooks file not found at ${TEXTBOOKS_FILE}`);
        }
        const textbooks: string[] = JSON.parse(fs.readFileSync(TEXTBOOKS_FILE, 'utf-8'));
        
        console.log(`Total textbooks found: ${textbooks.length}`);

        // 遍历处理所有教材
        for (let i = 0; i < textbooks.length; i++) {
            const book = textbooks[i];
            console.log(`\n--------------------------------------------------`);
            console.log(`Progress: [${i + 1}/${textbooks.length}]`);
            console.log(`Target: ${book}`);
            console.log(`--------------------------------------------------`);
            
            try {
                await processTextbook(book);
            } catch (error) {
                console.error(`Failed to process "${book}":`, error);
            }
        }

        console.log('\nProcessing complete!');
    } catch (error) {
        console.error('Fatal error in main:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

main().catch(console.error);

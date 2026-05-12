import 'dotenv/config';
import { connect, connection, Schema, model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

// Define VocabWord Schema strictly for script usage
interface VocabWord {
    headword: string;
    lemma: string;
    pos: string;
    cefr: string;
    definitionEn: string;
    definitionZh: string;
    exampleEn: string;
    levels: string[];
    topics: string[];
    textbooks: string[];
}

const VocabWordSchema = new Schema<VocabWord>({
    headword: { type: String, required: true },
    lemma: { type: String, required: true },
    pos: { type: String, required: true },
    cefr: { type: String, required: true },
    definitionEn: { type: String, required: true },
    definitionZh: { type: String, required: true },
    exampleEn: { type: String, required: true },
    levels: { type: [String], default: [] },
    topics: { type: [String], default: [] },
    textbooks: { type: [String], default: [] }
});

const VocabModel = model<VocabWord>('VocabWord', VocabWordSchema);

async function main() {
    const uri = process.env.MONGO_URL;
    if (!uri) {
        console.error('MONGO_URL not set');
        process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await connect(uri);

    const bookDir = path.join(__dirname, '../../book');
    if (!fs.existsSync(bookDir)) {
        console.error(`Book directory not found: ${bookDir}`);
        process.exit(1);
    }

    const files = fs.readdirSync(bookDir).filter(f => f.endsWith('.xlsx'));
    console.log(`Found ${files.length} textbooks.`);

    for (const file of files) {
        const textbookName = path.parse(file).name;
        console.log(`Processing ${textbookName}...`);

        try {
            const workbook = XLSX.readFile(path.join(bookDir, file));
            const sheetName = '单词';

            if (!workbook.SheetNames.includes(sheetName)) {
                console.warn(`  Sheet "${sheetName}" not found. Skipping.`);
                continue;
            }

            const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            let count = 0;
            let newCount = 0;

            for (const row of data as any[]) {
                const headword = row['word_content'];
                const translation = row['word_translation'];
                // Try to find pos from common columns
                const pos = row['pos'] || row['词性'] || row['part_of_speech'] || 'n.';
                const ipa = row['音标'] || row['phonetic'] || '';

                if (!headword) continue;

                const wordData = {
                    headword: headword,
                    lemma: headword, // Simplified
                    pos: pos,
                    cefr: 'A1', // Default
                    definitionEn: translation || headword, // Fallback
                    definitionZh: translation || '',
                    exampleEn: '', // Raw data lacks example sentences
                    levels: ['Middle'], // Defaulting to Middle for these textbooks
                };

                const existing = await VocabModel.findOne({ headword });
                if (existing) {
                    if (!existing.textbooks.includes(textbookName)) {
                        existing.textbooks.push(textbookName);
                        await existing.save();
                    }
                    // Optionally update other fields if missing
                } else {
                    await VocabModel.create({
                        ...wordData,
                        textbooks: [textbookName]
                    });
                    newCount++;
                }
                count++;
            }
            console.log(`  Processed ${count} words (New: ${newCount}) for ${textbookName}`);
        } catch (err: any) {
            console.error(`  Error processing ${file}: ${err.message}`);
        }
    }

    console.log('Done.');
    await connection.close();
}

main().catch(console.error);

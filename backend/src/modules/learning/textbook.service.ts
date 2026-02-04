import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VocabWordDocument } from './vocab.schema';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

@Injectable()
export class TextbookService implements OnModuleInit {
    private readonly logger = new Logger(TextbookService.name);
    private readonly bookDir = path.join(process.cwd(), '../book');

    constructor(@InjectModel('VocabWord') private vocabModel: Model<VocabWordDocument>) { }

    async onModuleInit() {
        await this.importTextbooks();
    }

    async listTextbooks(): Promise<string[]> {
        if (!fs.existsSync(this.bookDir)) return [];
        return fs.readdirSync(this.bookDir)
            .filter(f => f.endsWith('.xlsx'))
            .map(f => path.parse(f).name);
    }

    private async importTextbooks() {
        if (!fs.existsSync(this.bookDir)) {
            this.logger.warn(`Book directory not found at ${this.bookDir}`);
            return;
        }

        const files = fs.readdirSync(this.bookDir).filter(f => f.endsWith('.xlsx'));

        for (const file of files) {
            const textbookName = path.parse(file).name;
            this.logger.log(`Processing textbook: ${textbookName}`);

            try {
                const workbook = XLSX.readFile(path.join(this.bookDir, file));
                const sheetName = '单词';

                if (!workbook.SheetNames.includes(sheetName)) {
                    this.logger.warn(`Sheet "${sheetName}" not found in ${file}`);
                    continue;
                }

                const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                let count = 0;

                for (const row of data as any[]) {
                    const headword = row['word_content'];
                    const translation = row['word_translation'];
                    const pos = row['pos'] || row['词性'] || 'unknown'; // Handle various column names if needed based on inspection

                    if (!headword) continue;

                    // Simple upsert: find by headword
                    // Note: In a real scenario, we might want consistent lemmas. 
                    // For now, we assume headword is unique enough or we append to existing word.

                    await this.vocabModel.updateOne(
                        { headword: headword },
                        {
                            $setOnInsert: {
                                lemma: headword, // Simplified assumption
                                pos: 'n.', // Default if missing, or extract from row
                                cefr: 'A1', // Default
                                definitionEn: translation,
                                definitionZh: translation,
                                exampleEn: `Example for ${headword}`,
                                levels: ['Middle'] // Assume imported textbooks are for Middle school as per request
                            },
                            $addToSet: { textbooks: textbookName }
                        },
                        { upsert: true }
                    );
                    count++;
                }
                this.logger.log(`Imported/Updated ${count} words for ${textbookName}`);

            } catch (err) {
                this.logger.error(`Failed to process ${file}: ${err.message}`);
            }
        }
    }
}

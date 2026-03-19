import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserWordProgress, UserWordProgressDocument } from '../learning/user-word-progress.schema';
import { VocabWord, VocabWordDocument } from '../learning/vocab.schema';
import { Pet, PetDocument } from '../pet/pet.schema';

@Injectable()
export class DebugService {
  constructor(
    @InjectModel('UserWordProgress') private userWordProgressModel: Model<UserWordProgressDocument>,
    @InjectModel('VocabWord') private vocabWordModel: Model<VocabWordDocument>,
    @InjectModel(Pet.name) private petModel: Model<PetDocument>,
  ) {}

  async resetProgress(userId: string) {
    // Delete all progress for user
    await this.userWordProgressModel.deleteMany({ userId: new Types.ObjectId(userId) });
    return { message: 'User progress cleared' };
  }

  async resetReview(userId: string) {
    // Set nextReviewAt to now for all words
    await this.userWordProgressModel.updateMany(
      { userId: new Types.ObjectId(userId) },
      { $set: { nextReviewAt: new Date() } }
    );
    return { message: 'All words ready for review' };
  }

  async setWordStage(userId: string, word: string, stage: number) {
    // Find word by headword
    const vocabWord = await this.vocabWordModel.findOne({ headword: word });
    if (!vocabWord) {
      throw new NotFoundException(`Word "${word}" not found`);
    }

    // Update or create progress
    // If setting stage, we probably want it to be due for review immediately unless stage is 0 (new)
    // The prompt says: "set nextReviewAt to past"
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 1 day ago

    await this.userWordProgressModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), wordId: vocabWord._id },
      {
        $set: {
          stage: stage,
          nextReviewAt: pastDate,
          lastPracticedAt: new Date(),
        },
        $setOnInsert: {
          exposureCount: 0,
          correctCount: 0,
          wrongCount: 0,
          consecutiveCorrect: 0,
        }
      },
      { upsert: true, new: true }
    );
    return { message: `Word "${word}" stage set to ${stage} and ready for review` };
  }

  async updatePet(userId: string, stats: { exp?: number; level?: number; energy?: number }) {
    const update: any = {};
    if (stats.exp !== undefined) update.exp = stats.exp;
    if (stats.level !== undefined) update.level = stats.level;
    if (stats.energy !== undefined) update.energy = stats.energy;

    const pet = await this.petModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: update },
      { new: true }
    );
    
    if (!pet) {
        // Create pet if not exists? Usually pet is created on user creation.
        // But for debug, maybe we want to create if missing.
        // For now, let's throw if not found or return null.
        // The prompt says "Update pet stats".
        throw new NotFoundException('Pet not found for user');
    }
    return pet;
  }
}

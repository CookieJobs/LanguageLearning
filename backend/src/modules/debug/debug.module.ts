import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DebugController } from './debug.controller';
import { DebugService } from './debug.service';
import { UserWordProgressSchema } from '../learning/user-word-progress.schema';
import { VocabWordSchema } from '../learning/vocab.schema';
import { Pet, PetSchema } from '../pet/pet.schema';
import { UserSchema } from '../user/user.schema';
import { JwtGuard } from '../../common/jwt.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserWordProgress', schema: UserWordProgressSchema },
      { name: 'VocabWord', schema: VocabWordSchema },
      { name: Pet.name, schema: PetSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [DebugController],
  providers: [DebugService, JwtGuard],
})
export class DebugModule {}

// input: @nestjs/common, @nestjs/mongoose, ./learning.controller, ./vocab.service, ./story.controller, ./deepseek.service, ./vocab.schema, ./mastery.schema, ../user/user.schema, ../stats/stats.module, ./vocab-seed.service, ../../common/jwt.guard
// output: LearningModule
// pos: 后端/学习模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { LearningController } from './learning.controller'
import { VocabService } from './vocab.service'

import { StoryController } from './story.controller'
import { DeepSeekService } from './deepseek.service'
import { TextbookService } from './textbook.service'
import { ProgressService } from './progress.service'
import { VocabWordSchema } from './vocab.schema'
import { WordMasterySchema } from './mastery.schema'
import { UserWordProgressSchema } from './user-word-progress.schema'
import { LearningSchedulerService } from './learning-scheduler.service'
import { QuestionGeneratorService } from './question-generator.service'
import { UserSchema } from '../user/user.schema'
import { StatsModule } from '../stats/stats.module'
import { VocabSeedService } from './vocab-seed.service'
import { JwtGuard } from '../../common/jwt.guard'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'VocabWord', schema: VocabWordSchema },
      { name: 'WordMastery', schema: WordMasterySchema },
      { name: 'UserWordProgress', schema: UserWordProgressSchema }
    ]),
    StatsModule
  ],
  controllers: [LearningController, StoryController],
  providers: [
    JwtGuard, 
    VocabService, 
    DeepSeekService, 
    VocabSeedService, 
    TextbookService, 
    ProgressService,
    LearningSchedulerService,
    QuestionGeneratorService
  ],
  exports: [
    LearningSchedulerService,
    QuestionGeneratorService
  ]
})
export class LearningModule { }

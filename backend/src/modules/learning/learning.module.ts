import { Module } from '@nestjs/common'
import { LearningController } from './learning.controller'
import { PrismaService } from '../../common/prisma.service'
import { VocabService } from './vocab.service'
import { StatsService } from '../stats/stats.service'

import { StoryController } from './story.controller'
import { DeepSeekService } from './deepseek.service'

@Module({ controllers: [LearningController, StoryController], providers: [PrismaService, VocabService, StatsService, DeepSeekService] })
export class LearningModule { }

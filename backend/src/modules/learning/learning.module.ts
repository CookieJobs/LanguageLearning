// input: @nestjs/common, ./learning.controller, ../../common/prisma.service, ./vocab.service, ../stats/stats.service, ./story.controller, ./deepseek.service
// output: LearningModule
// pos: 后端/学习模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Module } from '@nestjs/common'
import { LearningController } from './learning.controller'
import { PrismaService } from '../../common/prisma.service'
import { VocabService } from './vocab.service'
import { StatsService } from '../stats/stats.service'

import { StoryController } from './story.controller'
import { DeepSeekService } from './deepseek.service'

@Module({ controllers: [LearningController, StoryController], providers: [PrismaService, VocabService, StatsService, DeepSeekService] })
export class LearningModule { }

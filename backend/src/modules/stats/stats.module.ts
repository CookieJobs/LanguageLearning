// input: @nestjs/common, ./stats.controller, ./stats.service, ../../common/prisma.service
// output: StatsModule
// pos: 后端/统计模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Module } from '@nestjs/common'
import { StatsController } from './stats.controller'
import { StatsService } from './stats.service'
import { PrismaService } from '../../common/prisma.service'

@Module({ controllers: [StatsController], providers: [StatsService, PrismaService] })
export class StatsModule {}


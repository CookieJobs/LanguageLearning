// input: @nestjs/common, @nestjs/mongoose, ./stats.controller, ./stats.service, ./stats.schema, ../user/user.schema, ../../common/jwt.guard
// output: StatsModule
// pos: 后端/统计模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { StatsController } from './stats.controller'
import { StatsService } from './stats.service'
import { DailyActivitySchema, UserStatsSchema } from './stats.schema'
import { UserSchema } from '../user/user.schema'
import { JwtGuard } from '../../common/jwt.guard'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'DailyActivity', schema: DailyActivitySchema },
      { name: 'UserStats', schema: UserStatsSchema }
    ])
  ],
  controllers: [StatsController],
  providers: [JwtGuard, StatsService],
  exports: [StatsService]
})
export class StatsModule {}

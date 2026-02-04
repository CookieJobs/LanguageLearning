// input: @nestjs/common, @nestjs/mongoose, ./auth/auth.module, ./learning/learning.module, ./stats/stats.module, ./user/user.module, ./health.controller
// output: AppModule
// pos: 系统/通用
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from './auth/auth.module'
import { LearningModule } from './learning/learning.module'
import { StatsModule } from './stats/stats.module'
import { UserModule } from './user/user.module'
import { HealthController } from './health.controller'

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/linguacraft'

@Module({
  imports: [MongooseModule.forRoot(mongoUrl), AuthModule, LearningModule, UserModule, StatsModule],
  controllers: [HealthController]
})
export class AppModule {}

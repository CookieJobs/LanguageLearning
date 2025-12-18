import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { LearningModule } from './learning/learning.module'
import { StatsModule } from './stats/stats.module'
import { UserModule } from './user/user.module'
import { HealthController } from './health.controller'

@Module({
  imports: [AuthModule, LearningModule, UserModule, StatsModule],
  controllers: [HealthController]
})
export class AppModule {}

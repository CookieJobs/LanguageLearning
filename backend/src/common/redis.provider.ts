import { FactoryProvider } from '@nestjs/common'
import Redis from 'ioredis'

export const REDIS = 'REDIS'

export const redisProvider: FactoryProvider<Redis> = {
  provide: REDIS,
  useFactory: () => new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
}

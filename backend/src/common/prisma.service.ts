// input: @nestjs/common, @prisma/client
// output: PrismaService
// pos: 后端/通用层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect() }
  async onModuleDestroy() { await this.$disconnect() }
}

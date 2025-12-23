// input: @nestjs/common, ./user.controller, ../../common/prisma.service
// output: UserModule
// pos: 后端/用户模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { PrismaService } from '../../common/prisma.service'

@Module({ controllers: [UserController], providers: [PrismaService] })
export class UserModule {}

// input: @nestjs/common, @nestjs/mongoose, ./user.controller, ./user.schema, ../../common/jwt.guard
// output: UserModule
// pos: 后端/用户模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UserController } from './user.controller'
import { UserSchema, UserProfileSchema } from './user.schema'
import { JwtGuard } from '../../common/jwt.guard'

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'User', schema: UserSchema },
    { name: 'UserProfile', schema: UserProfileSchema }
  ])],
  controllers: [UserController],
  providers: [JwtGuard],
  exports: [MongooseModule]
})
export class UserModule {}

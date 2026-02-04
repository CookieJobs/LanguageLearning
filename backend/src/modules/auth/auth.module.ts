// input: @nestjs/common, @nestjs/mongoose, ./auth.controller, ./auth.service, ./refresh-token.schema, ../user/user.schema, ../../common/jwt.guard
// output: AuthModule
// pos: 后端/鉴权模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { RefreshTokenSchema } from './refresh-token.schema'
import { UserSchema } from '../user/user.schema'
import { JwtGuard } from '../../common/jwt.guard'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'RefreshToken', schema: RefreshTokenSchema }
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard]
})
export class AuthModule {}

// input: @nestjs/common, ./auth.service, ../../common/jwt.guard, class-validator
// output: AuthController, route:auth
// pos: 后端/鉴权模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtGuard } from '../../common/jwt.guard'
import { IsEmail, IsOptional, IsString } from 'class-validator'

class RegisterDto { @IsEmail() email!: string; @IsString() password!: string; @IsOptional() @IsString() code?: string }
class LoginDto { @IsEmail() email!: string; @IsString() password!: string }
class RefreshDto { @IsString() refreshToken!: string }

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('register') register(@Body() body: RegisterDto) { return this.auth.register(body.email, body.password) }
  @Post('login') login(@Body() body: LoginDto) { return this.auth.login(body.email, body.password) }
  @Post('refresh') refresh(@Body() body: RefreshDto) { return this.auth.refresh(body.refreshToken) }
  @Post('logout') @UseGuards(JwtGuard) logout(@Req() req: any) { return this.auth.logout(req.user.id) }
}

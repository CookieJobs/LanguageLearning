import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtGuard } from '../../common/jwt.guard'
import { IsEmail, IsString, MinLength } from 'class-validator'
import { Request } from 'express'

class SendCodeDto { @IsEmail() email!: string }
class RegisterDto { @IsEmail() email!: string; @IsString() password!: string; @IsString() code!: string }
class LoginDto { @IsEmail() email!: string; @IsString() password!: string }
class RefreshDto { @IsString() refreshToken!: string }
class ForgotPasswordDto { @IsEmail() email!: string }
class ResetPasswordDto { @IsEmail() email!: string; @IsString() code!: string; @IsString() @MinLength(6) newPassword!: string }

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('send-code')
  sendCode(@Body() body: SendCodeDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || '0.0.0.0'
    return this.auth.sendVerificationCode(body.email, ip)
  }
  @Post('register') register(@Body() body: RegisterDto) { return this.auth.register(body.email, body.password, body.code) }
  @Post('login') login(@Body() body: LoginDto) { return this.auth.login(body.email, body.password) }
  @Post('refresh') refresh(@Body() body: RefreshDto) { return this.auth.refresh(body.refreshToken) }
  @Post('logout') @UseGuards(JwtGuard) logout(@Req() req: any) { return this.auth.logout(req.user.id) }
  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || '0.0.0.0'
    return this.auth.sendResetCode(body.email, ip)
  }
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body.email, body.code, body.newPassword)
  }
}

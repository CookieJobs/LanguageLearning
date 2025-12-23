// input: @nestjs/common, ../../common/prisma.service, ../../common/jwt.guard, class-validator
// output: UserController, route:me
// pos: 后端/用户模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { JwtGuard } from '../../common/jwt.guard'
import { IsOptional, IsString } from 'class-validator'

class UpdateMeDto { @IsOptional() @IsString() name?: string; @IsOptional() @IsString() avatarUrl?: string; @IsOptional() @IsString() educationLevel?: string }

@Controller('me')
export class UserController {
  constructor(private prisma: PrismaService) {}
  @Get() @UseGuards(JwtGuard)
  async me(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id }, include: { profile: true } })
    return { id: user?.id, email: user?.email, educationLevel: user?.profile?.educationLevel || null }
  }
  @Patch() @UseGuards(JwtGuard)
  async update(@Req() req: any, @Body() body: UpdateMeDto) {
    await this.prisma.userProfile.upsert({ where: { userId: req.user.id }, update: { name: body.name, avatarUrl: body.avatarUrl, educationLevel: body.educationLevel }, create: { userId: req.user.id, name: body.name, avatarUrl: body.avatarUrl, educationLevel: body.educationLevel } })
    return { ok: true }
  }
}

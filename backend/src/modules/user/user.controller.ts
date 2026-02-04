// input: @nestjs/common, @nestjs/mongoose, mongoose, ../../common/jwt.guard, class-validator, ./user.schema
// output: UserController, route:me
// pos: 后端/用户模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { JwtGuard } from '../../common/jwt.guard'
import { IsOptional, IsString } from 'class-validator'
import { UserDocument, UserProfileDocument } from './user.schema'

class UpdateMeDto { @IsOptional() @IsString() name?: string; @IsOptional() @IsString() avatarUrl?: string; @IsOptional() @IsString() educationLevel?: string; @IsOptional() @IsString() textbook?: string }

@Controller('me')
export class UserController {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('UserProfile') private profileModel: Model<UserProfileDocument>
  ) { }
  @Get() @UseGuards(JwtGuard)
  async me(@Req() req: any) {
    const user = await this.userModel.findById(req.user.id).lean()
    if (!user) return { id: req.user.id, email: null, educationLevel: null }
    const profile = await this.profileModel.findOne({ userId: String(user._id) }).lean()
    return { id: String(user._id), email: user.email, educationLevel: profile?.educationLevel || null, textbook: profile?.textbook || null }
  }
  @Patch() @UseGuards(JwtGuard)
  async update(@Req() req: any, @Body() body: UpdateMeDto) {
    await this.profileModel.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { name: body.name, avatarUrl: body.avatarUrl, educationLevel: body.educationLevel, textbook: body.textbook }, $setOnInsert: { userId: req.user.id } },
      { upsert: true, new: true }
    )
    return { ok: true }
  }
}

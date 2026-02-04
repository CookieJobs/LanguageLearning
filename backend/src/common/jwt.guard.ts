// input: @nestjs/common, @nestjs/mongoose, mongoose, jsonwebtoken
// output: JwtGuard
// pos: 后端/通用层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(@InjectModel('User') private userModel: Model<any>) { }
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest()
    const auth = req.headers['authorization'] || ''
    const token = (typeof auth === 'string' && auth.startsWith('Bearer ')) ? auth.slice(7) : null
    if (!token) throw new UnauthorizedException('TOKEN_EXPIRED')
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any
      const user = await this.userModel.findById(payload?.sub).lean() as unknown as { _id: unknown; email: string } | null
      if (!user) throw new UnauthorizedException('user_not_found')
      req.user = { id: String(user._id), email: user.email }
      return true
    } catch (e: any) {
      if (e?.name === 'TokenExpiredError') throw new UnauthorizedException('TOKEN_EXPIRED')
      if (e instanceof UnauthorizedException) throw e
      throw new UnauthorizedException('invalid_token')
    }
  }
}

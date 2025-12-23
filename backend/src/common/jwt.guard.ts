// input: @nestjs/common, jsonwebtoken
// output: JwtGuard
// pos: 后端/通用层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest()
    const auth = req.headers['authorization'] || ''
    const token = (typeof auth === 'string' && auth.startsWith('Bearer ')) ? auth.slice(7) : null
    if (!token) return false
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any
      req.user = { id: payload?.sub, email: payload?.email }
      return true
    } catch { return false }
  }
}

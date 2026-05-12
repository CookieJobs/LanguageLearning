// input: @nestjs/common, ./jwt.guard
// output: AdminGuard
// pos: 后端/通用层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UseGuards, applyDecorators } from '@nestjs/common'
import { JwtGuard } from './jwt.guard'

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest()
    if (!req.user?.isAdmin) {
      throw new ForbiddenException('admin_required')
    }
    return true
  }
}

// 组合装饰器：先 JWT 鉴权，再检查管理员
export const AdminAuth = () => applyDecorators(UseGuards(JwtGuard, AdminGuard))

// input: @nestjs/common, ../../common/jwt.guard, ./stats.service
// output: StatsController, route:stats
// pos: 后端/统计模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Controller, Get, Post, UseGuards, Req, Body } from '@nestjs/common'
import { JwtGuard } from '../../common/jwt.guard'
import { StatsService } from './stats.service'

@Controller('stats')
export class StatsController {
  constructor(private stats: StatsService) {}
  @Get('me') @UseGuards(JwtGuard)
  async me(@Req() req: any) { return this.stats.getStats(req.user.id) }
  @Post('checkin') @UseGuards(JwtGuard)
  async checkin(@Req() req: any, @Body() body: { date?: string }) {
    const date = body?.date ? new Date(body.date) : undefined
    return this.stats.checkin(req.user.id, date)
  }
}


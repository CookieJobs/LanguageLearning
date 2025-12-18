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


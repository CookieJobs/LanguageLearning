import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { DebugService } from './debug.service';
import { JwtGuard } from '../../common/jwt.guard';

@Controller('debug')
@UseGuards(JwtGuard)
export class DebugController {
  constructor(private readonly debugService: DebugService) {}

  @Post('reset-progress')
  async resetProgress(@Request() req) {
    return this.debugService.resetProgress(req.user.id);
  }

  @Post('reset-review')
  async resetReview(@Request() req) {
    return this.debugService.resetReview(req.user.id);
  }

  @Post('set-word-stage')
  async setWordStage(@Request() req, @Body() body: { word: string; stage: number }) {
    return this.debugService.setWordStage(req.user.id, body.word, body.stage);
  }

  @Post('pet')
  async updatePet(@Request() req, @Body() body: { exp?: number; level?: number; energy?: number }) {
    return this.debugService.updatePet(req.user.id, body);
  }
}

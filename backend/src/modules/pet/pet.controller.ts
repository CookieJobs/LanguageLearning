import { Controller, Get, Post, UseGuards, Req, BadRequestException } from '@nestjs/common'
import { PetService } from './pet.service'
import { JwtGuard } from '../../common/jwt.guard'

@Controller('pet')
@UseGuards(JwtGuard)
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Get()
  async getPet(@Req() req: any) {
    return this.petService.getPet(req.user.id)
  }

  @Post('feed')
  async feedPet(@Req() req: any) {
    return this.petService.feedPet(req.user.id)
  }

  @Post('interact')
  async interact(@Req() req: any) {
    return this.petService.interact(req.user.id)
  }
}

import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common'
import { WalletService } from './wallet.service'
import { JwtGuard } from '../../common/jwt.guard'

@Controller('wallet')
@UseGuards(JwtGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(@Req() req: any) {
    return this.walletService.getWallet(req.user.id)
  }

  // Optional: Debug endpoint to add coins (should be admin protected in production)
  // @Post('add')
  // async addCoins(@Req() req: any, @Body() body: { amount: number; reason: string }) {
  //   return this.walletService.addCoins(req.user.id, body.amount, body.reason)
  // }
}

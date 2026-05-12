import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'
import { Wallet, WalletSchema } from './wallet.schema'
import { JwtGuard } from '../../common/jwt.guard'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
    UserModule
  ],
  controllers: [WalletController],
  providers: [WalletService, JwtGuard],
  exports: [WalletService]
})
export class WalletModule {}

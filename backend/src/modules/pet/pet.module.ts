import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PetController } from './pet.controller'
import { PetService } from './pet.service'
import { Pet, PetSchema } from './pet.schema'
import { WalletModule } from '../wallet/wallet.module'
import { JwtGuard } from '../../common/jwt.guard'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pet.name, schema: PetSchema }]),
    WalletModule,
    UserModule
  ],
  controllers: [PetController],
  providers: [PetService, JwtGuard],
  exports: [PetService]
})
export class PetModule {}

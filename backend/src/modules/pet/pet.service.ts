import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Pet, PetDocument } from './pet.schema'
import { WalletService } from '../wallet/wallet.service'

@Injectable()
export class PetService {
  constructor(
    @InjectModel(Pet.name) private petModel: Model<PetDocument>,
    private walletService: WalletService
  ) {}

  async getPet(userId: string): Promise<PetDocument> {
    const userObjectId = new Types.ObjectId(userId)
    let pet = await this.petModel.findOne({ userId: userObjectId })
    if (!pet) {
      pet = await this.petModel.create({ userId: userObjectId })
    }
    return pet
  }

  async createDefault(userId: string): Promise<PetDocument> {
    return this.getPet(userId)
  }

  async restoreEnergy(userId: string, amount: number = 5): Promise<PetDocument> {
    const pet = await this.getPet(userId)
    pet.energy = Math.min(100, (pet.energy || 0) + amount)
    return pet.save()
  }

  async addExp(userId: string, amount: number): Promise<PetDocument> {
    const pet = await this.getPet(userId)
    pet.exp += amount

    // Simple level up logic: Level N requires N * 100 EXP
    const expNeeded = pet.level * 100
    if (pet.exp >= expNeeded) {
      pet.level += 1
      pet.exp -= expNeeded
      // Bonus coins for leveling up?
      await this.walletService.addCoins(userId, pet.level * 10, 'level_up_bonus')
    }
    
    return pet.save()
  }

  async feedPet(userId: string): Promise<{ pet: PetDocument; success: boolean; message: string }> {
    const cost = 10
    const hungerGain = 20
    
    const canAfford = await this.walletService.spendCoins(userId, cost, 'feed_pet')
    if (!canAfford) {
      throw new BadRequestException('Not enough coins to feed pet')
    }

    const pet = await this.getPet(userId)
    pet.hunger = Math.min(100, pet.hunger + hungerGain)
    await pet.save()
    
    return { pet, success: true, message: 'Pet fed successfully!' }
  }

  async interact(userId: string): Promise<{ pet: PetDocument; message: string }> {
    const pet = await this.getPet(userId)
    pet.lastInteractedAt = new Date()
    
    // Add small exp for interaction
    pet.exp += 5
    // Check level up (duplicate logic, maybe refactor)
    const expNeeded = pet.level * 100
    if (pet.exp >= expNeeded) {
        pet.level += 1
        pet.exp -= expNeeded
        await this.walletService.addCoins(userId, pet.level * 10, 'level_up_bonus')
    }

    await pet.save()

    const messages = [
      "Your pet looks happy!",
      "It makes a cute sound.",
      "It seems to be studying with you.",
      "Your pet is proud of your progress!"
    ]
    const message = messages[Math.floor(Math.random() * messages.length)]

    return { pet, message }
  }
}

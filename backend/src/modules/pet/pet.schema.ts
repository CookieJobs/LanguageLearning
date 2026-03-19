import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type PetDocument = HydratedDocument<Pet>

@Schema({ timestamps: true })
export class Pet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId

  @Prop({ default: 'My Pet' })
  name: string

  @Prop({ default: 1, min: 1 })
  level: number

  @Prop({ default: 0, min: 0 })
  exp: number

  @Prop({ default: 50, min: 0, max: 100 })
  hunger: number // 0 = starving, 100 = full

  @Prop({ default: 100, min: 0, max: 100 })
  energy: number // 0 = tired, 100 = energetic

  @Prop({ type: Object, default: { type: 'dragon', color: 'green' } })
  appearance: Record<string, any>

  @Prop({ default: Date.now })
  lastInteractedAt: Date
}

export const PetSchema = SchemaFactory.createForClass(Pet)

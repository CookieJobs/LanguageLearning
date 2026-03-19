// input: @nestjs/common, @nestjs/mongoose, mongoose, argon2, jsonwebtoken, ./refresh-token.schema, ../user/user.schema
// output: AuthService
// pos: 后端/鉴权模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as argon2 from 'argon2'
import * as jwt from 'jsonwebtoken'
import { RefreshTokenDocument } from './refresh-token.schema'
import { UserDocument } from '../user/user.schema'
import { PetService } from '../pet/pet.service'
import { WalletService } from '../wallet/wallet.service'

export interface Tokens { accessToken: string; refreshToken: string }

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('RefreshToken') private refreshModel: Model<RefreshTokenDocument>,
    private petService: PetService,
    private walletService: WalletService
  ) { }
  private signTokens(userId: string): Tokens {
    const secret = process.env.JWT_SECRET || 'dev_secret'
    const accessToken = jwt.sign({ sub: userId, jti: this.randomId() }, secret, { expiresIn: '24h' })
    const refreshToken = jwt.sign({ sub: userId, jti: this.randomId() }, secret, { expiresIn: '30d' })
    return { accessToken, refreshToken }
  }
  private randomId() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) }
  async register(email: string, password: string) {
    try {
      const exist = await this.userModel.findOne({ email }).lean()
      if (exist) throw new BadRequestException('email_exists')
      const hash = await argon2.hash(password)
      const user = await this.userModel.create({ email, passwordHash: hash })
      
      // Initialize Pet and Wallet
      await this.petService.createDefault(String(user._id))
      await this.walletService.createDefault(String(user._id))
      
      const tokens = this.signTokens(String(user._id))
      await this.storeRefresh(String(user._id), tokens.refreshToken)
      return { userId: String(user._id), ...tokens }
    } catch (e: any) { throw new BadRequestException(e?.message || 'register_failed') }
  }
  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email })
    if (!user) throw new UnauthorizedException('invalid_credentials')
    const ok = await argon2.verify(user.passwordHash, password)
    if (!ok) throw new UnauthorizedException('invalid_credentials')
    const userId = String(user._id)
    const tokens = this.signTokens(userId)
    await this.storeRefresh(userId, tokens.refreshToken)
    return { userId, ...tokens }
  }
  async refresh(refreshToken: string) {
    const secret = process.env.JWT_SECRET || 'dev_secret'
    let payload: any
    try { payload = jwt.verify(refreshToken, secret) } catch { throw new UnauthorizedException('invalid_refresh_token') }
    const found = await this.refreshModel.findOne({ userId: payload.sub }).sort({ expiresAt: -1 })
    if (!found) throw new UnauthorizedException('refresh_not_found')
    const ok = await argon2.verify(found.tokenHash, refreshToken)
    if (!ok) throw new UnauthorizedException('invalid_refresh_token')
    const tokens = this.signTokens(payload.sub)
    await this.storeRefresh(payload.sub, tokens.refreshToken)
    return tokens
  }
  async logout(userId: string) { await this.refreshModel.deleteMany({ userId }); return { ok: true } }
  private async storeRefresh(userId: string, token: string) {
    const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const hash = await argon2.hash(token)
    await this.refreshModel.create({ userId, tokenHash: hash, expiresAt: exp })
  }
}

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import * as argon2 from 'argon2'
import * as jwt from 'jsonwebtoken'

export interface Tokens { accessToken: string; refreshToken: string }

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }
  private signTokens(userId: string): Tokens {
    const secret = process.env.JWT_SECRET || 'dev_secret'
    const accessToken = jwt.sign({ sub: userId, jti: this.randomId() }, secret, { expiresIn: '15m' })
    const refreshToken = jwt.sign({ sub: userId, jti: this.randomId() }, secret, { expiresIn: '30d' })
    return { accessToken, refreshToken }
  }
  private randomId() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) }
  async register(email: string, password: string) {
    try {
      const exist = await this.prisma.user.findUnique({ where: { email } })
      if (exist) throw new BadRequestException('email_exists')
      const hash = await argon2.hash(password)
      const user = await this.prisma.user.create({ data: { email, passwordHash: hash } })
      const tokens = this.signTokens(user.id)
      await this.storeRefresh(user.id, tokens.refreshToken)
      return { userId: user.id, ...tokens }
    } catch (e: any) { throw new BadRequestException(e?.message || 'register_failed') }
  }
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new UnauthorizedException('invalid_credentials')
    const ok = await argon2.verify(user.passwordHash, password)
    if (!ok) throw new UnauthorizedException('invalid_credentials')
    const tokens = this.signTokens(user.id)
    await this.storeRefresh(user.id, tokens.refreshToken)
    return { userId: user.id, ...tokens }
  }
  async refresh(refreshToken: string) {
    const secret = process.env.JWT_SECRET || 'dev_secret'
    let payload: any
    try { payload = jwt.verify(refreshToken, secret) } catch { throw new UnauthorizedException('invalid_refresh_token') }
    const found = await this.prisma.refreshToken.findFirst({ where: { userId: payload.sub } })
    if (!found) throw new UnauthorizedException('refresh_not_found')
    const ok = await argon2.verify(found.tokenHash, refreshToken)
    if (!ok) throw new UnauthorizedException('invalid_refresh_token')
    const tokens = this.signTokens(payload.sub)
    await this.storeRefresh(payload.sub, tokens.refreshToken)
    return tokens
  }
  async logout(userId: string) { await this.prisma.refreshToken.deleteMany({ where: { userId } }); return { ok: true } }
  private async storeRefresh(userId: string, token: string) { const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); const hash = await argon2.hash(token); await this.prisma.refreshToken.create({ data: { userId, tokenHash: hash, expiresAt: exp } }) }
}

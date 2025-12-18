import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'

function dayStrUTC(d: Date): string { return d.toISOString().slice(0,10) }
function startOfDayUTC(d: Date): Date { return new Date(d.toISOString().slice(0,10) + 'T00:00:00.000Z') }

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}
  async getStats(userId: string) {
    const stats = await this.prisma.userStats.findUnique({ where: { userId } })
    return stats || { currentStreak: 0, longestStreak: 0, lastActivityDate: null, totalMastered: 0, id: '', userId }
  }
  async checkin(userId: string, date?: Date) {
    const now = date ? new Date(date) : new Date()
    const todayKey = startOfDayUTC(now)
    await this.prisma.dailyActivity.upsert({
      where: { userId_date: { userId, date: todayKey } },
      update: {},
      create: { userId, date: todayKey }
    })
    const stats = await this.prisma.userStats.findUnique({ where: { userId } })
    const last = stats?.lastActivityDate ? startOfDayUTC(new Date(stats.lastActivityDate)) : null
    const sameDay = last && dayStrUTC(last) === dayStrUTC(todayKey)
    let current = stats?.currentStreak || 0
    if (!sameDay) {
      if (last) {
        const diffDays = Math.floor((todayKey.getTime() - last.getTime())/86400000)
        current = diffDays === 1 ? (current + 1) : 1
      } else {
        current = 1
      }
    }
    const longest = Math.max(stats?.longestStreak || 0, current)
    const updated = await this.prisma.userStats.upsert({
      where: { userId },
      update: { currentStreak: current, longestStreak: longest, lastActivityDate: todayKey },
      create: { userId, currentStreak: current || 1, longestStreak: longest || (current || 1), totalMastered: 0, lastActivityDate: todayKey }
    })
    return { currentStreak: updated.currentStreak, longestStreak: updated.longestStreak, lastActivityDate: updated.lastActivityDate }
  }
}


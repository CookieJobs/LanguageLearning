// input: @nestjs/common, @nestjs/mongoose, mongoose, ./stats.schema
// output: StatsService
// pos: 后端/统计模块
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DailyActivityDocument, UserStatsDocument } from './stats.schema'

function dayStrUTC(d: Date): string { return d.toISOString().slice(0,10) }
function startOfDayUTC(d: Date): Date { return new Date(d.toISOString().slice(0,10) + 'T00:00:00.000Z') }

@Injectable()
export class StatsService {
  constructor(
    @InjectModel('DailyActivity') private activityModel: Model<DailyActivityDocument>,
    @InjectModel('UserStats') private statsModel: Model<UserStatsDocument>
  ) {}
  async getStats(userId: string) {
    const stats = await this.statsModel.findOne({ userId }).lean()
    return stats || { currentStreak: 0, longestStreak: 0, lastActivityDate: null, totalMastered: 0, id: '', userId }
  }
  async checkin(userId: string, date?: Date) {
    const now = date ? new Date(date) : new Date()
    const todayKey = startOfDayUTC(now)
    await this.activityModel.updateOne(
      { userId, date: todayKey },
      { $setOnInsert: { userId, date: todayKey } },
      { upsert: true }
    )
    const stats = await this.statsModel.findOne({ userId }).lean()
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
    const updated = await this.statsModel.findOneAndUpdate(
      { userId },
      { $set: { currentStreak: current, longestStreak: longest, lastActivityDate: todayKey }, $setOnInsert: { totalMastered: 0 } },
      { upsert: true, new: true }
    ).lean()
    return { currentStreak: updated?.currentStreak || 0, longestStreak: updated?.longestStreak || 0, lastActivityDate: updated?.lastActivityDate || null }
  }
}

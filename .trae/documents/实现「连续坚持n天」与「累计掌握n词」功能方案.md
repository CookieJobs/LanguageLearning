## 目标
- 在产品中展示两项数据：
  - 连续坚持 n 天（学习打卡连续天数）
  - 累计掌握 n 词（用户已掌握的词汇总数）
- 登录后跨设备一致；离线/失败时不破坏统计。

## 后端改造
### 数据模型
- WordMastery（已存在）：用于累计掌握 n 词（`COUNT(*)`）
- 新增 UserStats：用户统计快照（便于高效读取）
  - 字段：`userId`（唯一）、`totalMastered`（int）、`currentStreak`（int）、`longestStreak`（int）、`lastActivityDate`（date）
- 新增 DailyActivity：学习打卡日志（去重按日）
  - 字段：`userId`、`date`（索引，唯一(userId,date)）

### 更新逻辑
- 造句正确上报 `POST /api/learning/mastery` 时：
  1) 插入 WordMastery
  2) `totalMastered += 1`
  3) 记录 DailyActivity（若当日未写入则插入）
  4) 按规则更新连续天数：
     - 当日与 `lastActivityDate` 比较（用户时区，默认 UTC+8）：
       - 若是同一天：不变 `currentStreak`
       - 若是昨天：`currentStreak += 1`
       - 若是跨度>1天：`currentStreak = 1`
     - 更新 `longestStreak = max(longestStreak,currentStreak)`，刷新 `lastActivityDate`
- 首次登录批量同步：如本地有未上报掌握记录，批量写入后再触发 streak 更新（避免漏计）。

### 接口
- `GET /api/stats` → `{ totalMastered, currentStreak, longestStreak }`
- 可选：`POST /api/stats/recompute`（管理员）从 DailyActivity/WordMastery回算快照

## 前端改造
- 新增组件 StatsBadge（头部右侧或学习卡片上方）：
  - 展示：`连续 n 天`、`累计掌握 n 词`
- 数据来源：
  - 进入应用或登录后：调用 `GET /api/stats`
  - 每次掌握成功后：本地累计+1，同时触发后台更新；失败时回退显示本地计数（`linguaCraft_mastered.length`）
- 离线/错误处理：显示本地计数与“未同步”状态；下一次成功写入时刷新

## 规则与边界
- 时区：默认 UTC+8；后续支持用户时区（`UserProfile.timezone`）
- 去重：当天多次学习只计一次 streak；WordMastery 按条计数
- 回补：如果批量同步历史掌握，`totalMastered`与历史 DailyActivity都会被增量纳入
- 安全：所有接口需鉴权（JWT）

## 验证
- 单日多次掌握 → streak 不变、total + 每次
- 连续两日掌握 → streak 累加
- 间隔一天未学习 → streak 重置为 1
- `GET /api/stats` 一致性：与 `WordMastery COUNT` 对齐

## 交付内容
- Prisma schema 迁移（UserStats、DailyActivity）
- 后端服务更新：`/api/learning/mastery` 更新统计、`/api/stats` 查询
- 前端组件 StatsBadge 与拉取逻辑；在学习成功后刷新显示

如确认，我将开始实现：先后端表与接口、再前端展示与联动，并完成端到端验证。
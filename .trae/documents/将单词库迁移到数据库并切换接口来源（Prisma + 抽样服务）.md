## 目标
- 用数据库替代本地 JSON，集中管理各学段词库，保证稳定、可扩展、可审计。
- 维持现有前端协议不变；接口 `/api/learning/words` 改为从数据库抽样（支持权重与排除）。

## 数据库与ORM
- 选型：开发使用 SQLite（零依赖），生产使用 Postgres（推荐）。
- ORM：沿用项目现有 Prisma。

## Prisma Schema（核心表）
```prisma
enum VocabCEFR { A1 A2 B1 B2 C1 C2 }

model VocabWord {
  id           String   @id @default(cuid())
  headword     String
  lemma        String
  pos          String
  cefr         VocabCEFR
  freqRank     Int?
  definitionEn String
  definitionZh String
  exampleEn    String
  ipa          String?
  audioUrl     String?
  variants     Json?
  topics       VocabWordTopic[]
  levels       VocabWordLevel[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@unique([lemma, pos])
  @@index([headword])
  @@index([cefr])
}

model VocabTopic {
  id    Int    @id @default(autoincrement())
  code  String @unique
  name  String
  words VocabWordTopic[]
}

model VocabWordTopic {
  wordId  String
  topicId Int
  word    VocabWord @relation(fields: [wordId], references: [id], onDelete: Cascade)
  topic   VocabTopic @relation(fields: [topicId], references: [id], onDelete: Cascade)
  @@id([wordId, topicId])
}

model VocabLevel {
  id    Int    @id @default(autoincrement())
  code  String @unique // Primary|Middle|High|University|Professional
  name  String
  words VocabWordLevel[]
}

model VocabWordLevel {
  wordId  String
  levelId Int
  word    VocabWord @relation(fields: [wordId], references: [id], onDelete: Cascade)
  level   VocabLevel @relation(fields: [levelId], references: [id], onDelete: Cascade)
  @@id([wordId, levelId])
}
```

## 迁移与数据导入
- 新增 Prisma schema；生成迁移并应用到本地数据库。
- 种子脚本：读取 `data/vocab/words.json`，写入 `VocabWord`、`VocabLevel(五学段)`、`VocabTopic` 与关联表：
  - `levels` 数组 → 插入 `VocabWordLevel`
  - `topics` 数组 → 插入/查找 `VocabTopic` 并插入 `VocabWordTopic`
- 幂等策略：按 `lemma+pos` 去重；重复则更新字段。

## 抽样服务（替换现有 VocabService 文件实现）
- 从 Prisma 查询候选：`where levels.some(level.code==目标学段) AND NOT IN exclude`；
- 去重：按 `lemma` 去重；
- 权重：基于 CEFR 权重 + `1/freqRank` 微调；按种子做稳定排序；
- 输出映射到现有前端结构：`{ word, definition: {English, Chinese}, partOfSpeech, example }`。
- 缓存：进程内 LRU 缓存候选列表（按学段），每日切换种子保证“当天稳定”。

## 接口改造
- 修改 `POST /api/learning/words`：调用新的数据库版抽样服务；移除模型调用回退逻辑。
- 环境变量：`DATABASE_URL`（Prisma），`VOCAB_PATH` 不再必须，仅用于一次性导入。

## 管理与工具
- 新增维护脚本：
  - `scripts/seed-vocab-from-json.ts`：从 JSON 导入/更新词库（幂等）；
  - `scripts/export-vocab-to-json.ts`：从库导出为 JSON（版本归档）。
- 后台接口（可选）：
  - 列表/检索词条、按学段与主题过滤；
  - 批量导入/更新；

## 测试与验证
- 单元：
  - 抽样权重与排除；种子稳定；
- 集成：
  - 前端拉词返回 5 条；exclude 生效；
- 性能：
  - 抽样 P95 < 50ms；数据库冷启动后缓存命中。

## 升级与回滚
- 迁移版本化；保留 JSON 作为备份导入源；
- 回滚策略：保留旧 `VocabService` 的文件读取实现作为紧急开关（仅在数据库不可用时手动切换）。

## 交付内容
- Prisma schema 与迁移
- 抽样服务（数据库版）
- 词库导入/导出脚本
- 修改后的接口实现与基础测试

请确认，我将开始：创建 Prisma 模型与迁移、实现数据库版抽样、提供导入脚本并切换接口到数据库。
# 复刻 Prompt：构建同等功能的语言学习产品（LinguaCraft）

## 目标
- 构建一个前后端分离的英语词汇学习应用，支持用户注册/登录、按学段抽样推词、句子正确性 AI 评估、掌握记录、回顾与连续打卡统计。
- 技术栈：前端 React + Vite + React Router；后端 NestJS + Prisma；数据库开发用 SQLite，生产可切换 Postgres；容器化与 NGINX 反代。

## 技术栈与约束
- 前端：`React 18/19`、`Vite`、`React Router`；开发代理将 `/api` 转发到后端。
- 后端：`NestJS`（全局 `ValidationPipe` + `CORS` + 全局前缀 `/api`）、`Prisma`（ORM）、`argon2`（密码哈希）、`jsonwebtoken`（JWT）、`node-fetch`（外部 AI 评估）。
- 数据库：开发默认 `SQLite`（`file:./prisma/dev.db`），可配置成 `Postgres`；提供词库导入脚本从 `data/vocab/words.json`。
- 部署：提供前后端 Dockerfile、`docker-compose` 与 `NGINX` 统一反代 `/api`。

## 关键功能
- 认证：注册、登录、刷新令牌、登出（访问令牌 + 刷新令牌；刷新令牌服务端保存哈希）。
- 学习：
  - 按学段（如 CEFR）与频率/权重抽样推送单词，去重与上下文避免重复。
  - 用户提交包含目标词的英文句子，后端调用外部 AI（DeepSeek Chat Completions）进行正确性与反馈评估；若无 API Key，提供本地兜底（词命中 + 简单规则）。
  - 正确后写入掌握记录，保存用户句子与该词的释义信息。
- 回顾与统计：
  - 已掌握列表分页/筛选。
  - 每日活动打卡与连续天数统计（当前连续与最长连续、最后活跃日）。
- 前端体验：
  - 登录态守卫（无令牌重定向登录）。
  - 发音播放（`SpeechSynthesisUtterance`）。
  - 学段选择、造句交互、示例提示、打卡与总掌握数徽章展示。

## 前端需求
- 路由结构：
  - `/login` 登录页
  - `/` 首页（学段选择与统计；需登录）
  - `/learn/:level` 学习页（交互造句；需登录）
  - `/review` 回顾页（已掌握列表；需登录）
- 全局状态：
  - 上下文提供：用户 `token`/`refreshToken`、邮箱、学习会话状态（当前词/进度/加载态）、已掌握列表缓存、打卡状态。
  - 本地存储键：`linguaCraft_token`、`linguaCraft_refresh`、`linguaCraft_mastered`、`linguaCraft_streak`。
- API 封装：
  - 统一 `/api` 前缀；自动在请求头附加 `Authorization: Bearer <token>`。
  - 若后端返回 `401`，清理本地存储，触发全局强制登出并重定向 `/login`。
- 主要页面与组件：
  - 登录页：邮箱+密码登录，注册切换。
  - 首页：学段选择卡片、今日打卡状态、总掌握数与连续天数徽章。
  - 学习页：当前词信息（词形、词性、英/中释义、例句、频率/等级）、输入框提交英文句子，显示 AI 评估的正确性、反馈与分数；正确后允许“标记掌握”，支持发音播放。
  - 回顾页：已掌握列表，展示用户句子与原词信息，支持基本筛选。

## 后端需求
- 应用入口：
  - 读取 `.env`，设置 `CORS`、全局 `ValidationPipe`、全局前缀 `/api`，监听 `API_PORT`（默认 `5500`）。
- 模块划分：`Auth`、`Learning`、`Stats`、`User`、`Health`。
- 认证模块（`/api/auth`）：
  - `POST /register`：Body `{ email, password, name? }`；返回 `{ userId }` 或基本用户对象。
  - `POST /login`：Body `{ email, password }`；返回 `{ token, refreshToken }`。
  - `POST /refresh`：Body `{ refreshToken }`；返回新 `{ token }` 与可选新 `refreshToken`。
  - `POST /logout`（需认证）：清除服务端刷新令牌哈希，返回 `{ success: true }`。
  - 密码存储使用 `argon2`，访问令牌使用 `JWT_SECRET` 签发；刷新令牌保存哈希与有效期。
- 学习模块（`/api/learning`，均需认证）：
  - `POST /words`：Body `{ level: string, batchSize?: number }`；返回单词数组：`[{ id, lemma, pos, cefr, meaningEn, meaningZh, exampleEn, exampleZh, frequency }]`。
  - `POST /evaluate`：Body `{ sentence: string, targetWordId: number }`；调用 `DeepSeek Chat Completions`（`DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`），返回 `{ isCorrect: boolean, feedback: string, score: number }`；若无 Key，走本地兜底。
  - `POST /mastery`：Body `{ wordId: number, userSentence: string }`；写入掌握记录，返回 `{ success: true }`。
  - `POST /mastery/list`：Body `{ page?: number, pageSize?: number }`；返回已掌握列表与分页信息。
- 统计模块（`/api/stats`，需认证）：
  - `GET /me`：返回 `{ totalMastered, currentStreak, longestStreak, lastActiveDate }`。
  - `POST /checkin`：记录今日活动，更新连续统计，返回最新统计。
- 用户模块（需认证）：
  - `GET /api/me`：返回基本用户信息与扩展资料。
  - `PATCH /api/me`：更新资料（如昵称、目标级别），返回最新资料。
- 健康检查：`GET /api/health`：返回 `{ status: 'ok' }`。
- 鉴权：`Authorization: Bearer <token>`；守卫注入 `req.user`。

## 数据模型（Prisma）
- `User`：`id, email(unique), passwordHash, createdAt`
- `RefreshToken`：`id, userId(fk), tokenHash, expiresAt, createdAt`
- `UserProfile`：`id, userId(fk), displayName, targetLevel`
- `DailyActivity`：`id, userId(fk), date(unique per user)`
- `UserStats`：`id, userId(fk), totalMastered, currentStreak, longestStreak, lastActiveDate`
- `WordMastery`：`id, userId(fk), wordId(fk), userSentence, masteredAt`
- `VocabWord`：`id, lemma, pos, cefr, frequency, meaningEn, meaningZh, exampleEn, exampleZh, index`
- `VocabLevel`、`VocabTopic` 与桥表：`VocabWordLevel`、`VocabWordTopic`

## 词库导入
- 数据源：`data/vocab/words.json`（词条包含词形、词性、CEFR、频率、英/中释义与例句、索引）。
- 脚本：`npm run seed`（后端）将 JSON 写入 `VocabWord`、`VocabLevel`、`VocabTopic` 与桥表。
- 要求：可幂等处理与基本去重（如 `lemma+pos` 唯一）。

## 环境变量
- 后端（`.env`）：
  - `API_PORT=5500`
  - `DATABASE_URL=file:./prisma/dev.db`（或 Postgres 连接串）
  - `JWT_SECRET=<required>`
  - `DEEPSEEK_API_KEY=<optional>`（缺省时走本地评估兜底）
  - `DEEPSEEK_MODEL=deepseek-chat`
  - `REDIS_URL=<optional>`（当前版本可不使用）
- 前端：使用 Vite，无需前端 `.env`；通过代理访问 `/api`。

## 开发与运行
- 本地：
  - 后端：`npm install && npx prisma generate && npm run dev`
  - 前端：`npm install && npm run dev`
  - 开发代理：`/api` → `http://localhost:5500`
- Docker（开发/生产）：
  - 提供 `docker-compose.yml`：Postgres（可选）、Redis（可选）、后端；生产另有前端静态与 NGINX。
  - NGINX：静态托管前端，`location /api/` 反代到后端。

## 非功能性与约束
- 安全：
  - 不记录敏感信息与密钥；刷新令牌仅保存哈希。
  - 所有受保护路由强制 `JwtGuard`；前端 401 触发强制登出。
- 可用性：
  - 后端无 AI Key 时自动降级评估；错误消息清晰可读。
- 规范：
  - 后端开启 `ValidationPipe`；统一错误响应结构。
  - 代码组织清晰，模块单一职责，服务与控制器分离。

## 验收标准
- 无 Key 情况下，学习评估仍可用（降级逻辑生效）。
- 登录后可选学段，拿到词列表并进行造句评估；正确后写入掌握记录。
- 回顾页可查看掌握记录；首页展示总掌握与连续天数。
- 认证流完整：注册/登录/刷新/登出；401 自动登出与重定向。
- 发音播放正常；健康检查返回 `ok`；统计打卡正确累计。

## 交互与细节
- 评估反馈包含 `反馈文本` 与 `分数`；低分提示改进建议。
- 前端在学习页展示词信息卡片与例句提示；支持一键发音。
- 成功掌握后，页内给出“继续学习”与“回顾列表”入口。

---
该 Prompt 可交给其他 AI IDE，按上述规格重建一个同等功能的语言学习应用（LinguaCraft），包括前后端、数据模型、API、环境变量、容器与前端交互体验。
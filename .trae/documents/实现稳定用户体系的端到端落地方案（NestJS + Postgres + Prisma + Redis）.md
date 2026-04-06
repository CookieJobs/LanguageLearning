## 总体目标
- 建立稳定的用户体系：注册/登录/刷新/登出、权限控制、速率限制、审计日志、密码重置与邮箱验证。
- 与现有学习业务解耦，统一 `/api` 契约，逐步将现有端点放入鉴权保护。

## 技术栈与目录规划
- 后端：NestJS（TypeScript）+ Prisma
- 数据库：PostgreSQL（容器）
- 会话/缓存/限流：Redis（容器）
- 部署：Docker Compose（`api` + `postgres` + `redis`）
- 日志：pino（结构化日志）
- 目录：新增 `api/`（NestJS 项目），保留现有前端及 DeepSeek 服务（后续迁移至 `api`）

## 数据模型（Prisma schema）
- `User`：id、email（唯一）、passwordHash、status、createdAt
- `UserProfile`：userId、name、avatarUrl、educationLevel
- `AuthProvider`：userId、provider（password、oauth）、providerUid
- `RefreshToken`：userId、tokenHash、expiresAt、revokedAt、deviceInfo、ipLast
- `EmailVerification`：userId、codeHash、expiresAt、consumed
- `PasswordReset`：userId、codeHash、expiresAt、consumed
- （预留）`WordMastery`、`LearningSession`：对接当前学习进度云端同步

## 安全与鉴权设计
- 密码：Argon2id（适当 `time_cost`/`memory_cost`）
- Access Token：JWT（短期，有 JTI）
- Refresh Token：持久化、轮换策略、设备绑定与近端 IP 检查
- 限流：基于 Redis（IP + 用户维度，漏桶/令牌桶）
- CSRF：如浏览器端采用 Cookie 承载 Access，则启用 `SameSite=strict` + CSRF token；否则走 Bearer 头
- 审计：登录失败、密码变更、令牌刷新/撤销、API Key 使用等事件入库并打日志

## 后端模块划分（NestJS）
- `AuthModule`：注册/登录/刷新/登出、守卫（JWT）、策略与拦截器
- `UserModule`：`GET /me`、`PATCH /me`、资料更新
- `VerificationModule`：邮箱验证码、密码重置流程（邮件服务对接 Resend/SendGrid）
- `LearningModule`：迁移现有 `/api/words`、`/api/evaluate` 至受鉴权模块（DeepSeek 调用封装为 provider）
- `RateLimitModule`：全局限流；`Auth` 相关接口单独阈值
- `AuditModule`：结构化日志与审计入库

## API 契约（示例）
- `POST /auth/register`：`{ email, password, code }` → `201`
- `POST /auth/login`：`{ email, password }` → `{ accessToken, refreshToken }`
- `POST /auth/refresh`：`{ refreshToken }` → 新的 `{ accessToken, refreshToken }`
- `POST /auth/logout`：撤销当前设备的刷新令牌 → `204`
- `GET /me`：当前用户信息 → `200`
- `PATCH /me`：更新资料 → `200`
- 受鉴权：`POST /learning/words`（原 `/api/words`）、`POST /learning/evaluate`（原 `/api/evaluate`）

## 前端改造要点
- 新增登录/注册页与邮箱验证码流程；成功登录后持久化令牌
- 请求拦截器：自动附加 Access Token；遇 401 时透明刷新；刷新失败则登出
- 将现有 `localStorage` 的掌握词汇在首次登录时批量上报至后端（随后增量同步）
- 对学习端点加鉴权调用；UI 保持不变

## 环境与部署
- `.env`（api）：`DATABASE_URL`、`REDIS_URL`、`JWT_SECRET`、`ARGON2_*`、`MAIL_*`、`DEEPSEEK_API_KEY`
- `docker-compose.yml`：Postgres（持久卷）、Redis、api（端口与网络）
- CI/CD：
  - 安装依赖 → Prisma migrate → 单元与 e2e 测试 → 构建/发布容器

## 迁移与上线步骤
1. 创建 `api/` 项目骨架（NestJS + Prisma + Docker Compose），编写数据模型并迁移
2. 实现 `AuthModule` 与基础接口、限流与审计；接入邮件服务
3. 迁移 `words/evaluate` 至 `LearningModule` 并加鉴权；封装 DeepSeek provider
4. 前端接入登录流程与拦截器；实现本地进度同步
5. 端到端测试与性能校验；灰度上线（仅在鉴权后开放学习接口）

## 交付物
- 可启动的 `api/` 服务（Docker 化）
- Prisma schema 与迁移脚本
- API 文档（OpenAPI/Swagger）与 Postman 集合
- 基本告警与日志配置

确认后我将开始按此方案搭建骨架并分步迁移现有端点，保证功能不中断。
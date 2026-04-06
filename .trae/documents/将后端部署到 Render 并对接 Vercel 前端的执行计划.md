## 目标
- 使用国内云（阿里云/腾讯云/华为）在中国大陆机房部署后端，前端静态资源走国内对象存储+CDN，提供稳定、低延迟的国内访问体验。

## 合规与准备
- 域名与备案：
  - 选择你的主域名（建议使用同一品牌域名）。
  - 在云厂商控制台完成主体/网站 ICP 备案（需营业执照或个人备案资料），备案周期通常 1–3 周。
  - 备案完成后，域名可在国内云上正常对外提供服务。

## 架构设计
- 后端：
  - 云主机（ECS/CVM）运行 Node/NestJS 服务；或使用容器服务（ACK/TKE）运行镜像。
  - 数据库使用云数据库（RDS for PostgreSQL），同地域部署以降低延迟。
  - 反向代理：Nginx 仅用于 `/api` 代理至后端或直接让后端监听 80/443（推荐 Nginx 统一证书和路由）。
- 前端：
  - 构建产物上传到对象存储（OSS/COS）。
  - 前置国内 CDN（CDN 回源到对象存储），绑定你的前端域名（备案域名）。

## 必要代码与配置变更
- 端口兼容（后端）：将 `backend/src/main.ts` 改为 `process.env.PORT || process.env.API_PORT || 5500`（当前仅读取 `API_PORT`，backend/src/main.ts:15）。
- 前端 API 基址：已支持通过 `VITE_API_BASE_URL` 设置（frontend/services/config.ts:1）。部署后将其指向你的后端域名（例如 `https://api.example.com`）。
- 健康检查与路由：后端健康检查为 `/api/health`（backend/src/modules/health.controller.ts:5）；全局前缀 `/api`（backend/src/main.ts:12）。

## 详细实施步骤
1) 数据库与密钥
- 在同一地域创建 RDS PostgreSQL，获得 `DATABASE_URL`（注意用户名/密码与内网/公网访问策略）。
- 统一整理环境变量：`DATABASE_URL`、`JWT_SECRET`（强随机）、`DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL=deepseek-chat`、`API_PORT`（如不使用 `PORT`）。

2) 后端部署
- 方式 A（容器）：使用仓库 `deploy/backend/Dockerfile` 构建镜像；在 ECS 或 ACK/TKE 部署，启动命令：`npx prisma migrate deploy && node dist/main.js`。
- 方式 B（裸机）：
  - `npm ci && npx prisma generate && npm run build`
  - `npx prisma migrate deploy && node dist/main.js`
- Nginx 反代：将 `api.example.com` 指向云主机；Nginx `location /api/ { proxy_pass http://127.0.0.1:5500/api/; }`（参考 deploy/nginx/nginx.conf:26-33）。
- TLS：申请免费证书（Let’s Encrypt）或使用云厂商证书服务，配置到 Nginx。

3) 前端部署（对象存储 + CDN）
- 本地或 CI 构建前端：`npm run build`，产物在 `frontend/dist`。
- 上传到对象存储（OSS/COS）对应的 Bucket。
- 开启 CDN 并将前端域名（如 `www.example.com`）绑定到 CDN 服务，回源设置为对象存储。
- 缓存策略：对 `index.html` 设置较短 TTL（以便灰度/更新），对静态 `assets/*` 设置较长 TTL。

4) 前端对接后端
- 在对象存储/静态站点的环境中无需 `vercel.json`；只需确保前端打包时注入 `VITE_API_BASE_URL=https://api.example.com`（可通过构建命令注入或使用 `.env.production`）。
- 如仍保留 Vercel 用于预览环境：在 Vercel 项目中设置同样的 `VITE_API_BASE_URL`，但正式域名走国内 CDN。

5) 验证
- `GET https://api.example.com/api/health` 返回 `{ ok: true }`。
- 注册/登录：`POST https://api.example.com/api/auth/register|login` 返回令牌（frontend/components/Auth.tsx:21；backend/src/modules/auth/auth.controller.ts:13-15）。
- 用户与统计：`GET https://api.example.com/api/me`、`/api/stats/me` 正常（backend/src/modules/user/user.controller.ts:9-17；backend/src/modules/stats/stats.controller.ts:7-13）。
- 学习流程：`https://api.example.com/api/learning/*` 正常（backend/src/modules/learning/learning.controller.ts:15-42）。

## 运维与安全
- 数据库安全组：仅允许云主机内网访问；如需公网访问，限制 IP 并启用 SSL。
- 日志与监控：接入云监控（CPU/内存/网络）、错误上报（Sentry 可选）。
- 灰度发布：前端通过 CDN 版本化资源，后端通过滚动重启或双实例切换。
- 密钥与连接串：仅放云厂商的环境变量或密钥管理服务；仓库不提交敏感信息（backend/.env.example 已为占位）。

## 我将为你执行
- 提交后端端口兼容代码修改；准备 Nginx 反代与 TLS 示例配置。
- 输出对象存储与 CDN上传脚本/指引，整理 `.env.production` 示例。
- 指导你在云厂商控制台完成 RDS/域名解析/CDN 回源/证书绑定，完成上线与验证。

请确认以上计划，我将开始具体实施与交付。
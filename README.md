<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI app

本仓库已采用清晰的前后端分层：
- 前端（Vite + React）在 `frontend/`，开发端口 `300x`（按占用自动调整）。
- 后端（NestJS + Prisma）在 `backend/`，统一前缀 `/api`，开发端口 `5500`。

## 本地运行

**先决条件：** Node.js（建议 v18+）、本地或容器化的 Postgres 与 Redis（可选）

1. 安装前端依赖：
   `npm install`
2. 配置后端环境：进入 `backend/`，将 `.env.example` 复制为 `.env`，并设置：
   - `API_PORT=5500`
   - `DATABASE_URL`（本地默认示例为 `file:./prisma/dev.db`，或指向数据库）
   - `JWT_SECRET`
   - `DEEPSEEK_API_KEY`（以及可选 `DEEPSEEK_MODEL`，默认 `deepseek-chat`）
3. 启动后端：
   `cd backend && npm install && npx prisma generate && npm run dev`
4. 在另一个终端启动前端：
   `npm run dev`

前端开发代理已将 `/api` 请求转发到 `http://localhost:5500`（见 `frontend/vite.config.ts`）。

## Docker Compose（可选）
使用根目录的 `docker-compose.yml` 可以一键启动 Postgres、Redis 与后端 Backend 服务。请确保端口与环境变量一致（已统一为 `5500`）。

## 部署
生产部署资产位于 `deploy/`，包含 `deploy/frontend/Dockerfile` 与 `deploy/backend/Dockerfile`，以及 NGINX 反向代理配置（上游为 `backend` 服务）。请根据实际域名与 TLS 证书调整 `deploy/nginx/nginx.conf`。

## 文档与更新约定
- 任意功能、架构、写法的改动完成后，必须同步更新受影响目录的 `README.md` 与相关文件的开头注释（input/output/pos）。
- 未同步更新视为变更未完成；提交请包含对应文档同步。
- 每个目录必须维护：三行极简架构说明（≤3行）+“一旦我所属的文件夹有所变化，请更新我。”声明+文件清单（文件名/地位/功能）。

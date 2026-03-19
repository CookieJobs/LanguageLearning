

# Run and deploy your AI app

本仓库已采用清晰的前后端分层：
- 前端（Vite + React）在 `frontend/`，开发端口 `300x`（按占用自动调整）。
- 后端（NestJS + Prisma）在 `backend/`，统一前缀 `/api`，开发端口 `5500`。

## 本地运行

**先决条件：** Node.js（建议 v18+）、本地或容器化的 MongoDB 与 Redis（可选）

1. 安装前端依赖：
   `npm install`
2. 配置后端环境：进入 `backend/`，将 `.env.example` 复制为 `.env`，并设置：
   - `API_PORT=5500`
   - `MONGO_URL`（本地默认示例为 `mongodb://localhost:27017/linguacraft`）
   - `JWT_SECRET`
   - `DEEPSEEK_API_KEY`（以及可选 `DEEPSEEK_MODEL`，默认 `deepseek-chat`）
3. 启动后端：
   `cd backend && npm install && npm run dev`
   启动后会自动导入 `data/vocab/words.json` 词库（若数据库为空）。
4. 在另一个终端启动前端：
   `npm run dev`

前端开发代理已将 `/api` 请求转发到 `http://localhost:5500`（见 `frontend/vite.config.ts`）。

## Docker Compose（可选）
使用根目录的 `docker-compose.yml` 可以一键启动 MongoDB、Redis 与后端 Backend 服务。请确保端口与环境变量一致（已统一为 `5500`）。

## 部署
生产部署资产位于 `deploy/`，包含 `deploy/frontend/Dockerfile` 与 `deploy/backend/Dockerfile`，以及 NGINX 反向代理配置（上游为 `backend` 服务）。请根据实际域名与 TLS 证书调整 `deploy/nginx/nginx.conf`。

## 文档与更新约定
- 任意功能、架构、写法的改动完成后，必须同步更新受影响目录的 `README.md` 与相关文件的开头注释（input/output/pos）。
- 未同步更新视为变更未完成；提交请包含对应文档同步。
- 每个目录必须维护：三行极简架构说明（≤3行）+“一旦我所属的文件夹有所变化，请更新我。”声明+文件清单（文件名/地位/功能）。

## 生产环境部署

### 使用 Docker Compose 部署
1. **准备环境变量**：
   ```bash
   # 复制环境变量模板
   cp .env.example .env
   # 编辑 .env 文件，设置以下变量：
   # DEEPSEEK_API_KEY=your_deepseek_api_key_here
   # JWT_SECRET=your_secure_jwt_secret_here
   ```

2. **使用生产配置**：
   ```bash
   # 复制生产配置模板
   cp docker-compose.prod.yml.example docker-compose.prod.yml
   # 启动所有服务
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **验证部署**：
   ```bash
   # 检查服务状态
   docker-compose -f docker-compose.prod.yml ps
   
   # 测试健康检查
   curl http://localhost:5500/api/health
   
   # 访问前端
   curl http://localhost
   ```

### 部署修复说明
本次部署修复解决了以下问题：
1. **Docker构建问题**：在 `backend/Dockerfile` 中添加了构建工具以支持原生模块
2. **环境变量安全**：生产配置使用环境变量而非硬编码密钥
3. **Nginx配置**：正确配置了前端服务端口 (5173)

### 安全注意事项
- 不要将包含真实API密钥的 `.env` 文件提交到版本控制
- 定期更换 JWT_SECRET 和 API 密钥
- 使用强密码保护数据库和Redis服务

## 目标
- 将后端目录 `api/` 重命名为 `backend/`，使前后端结构清晰：`frontend/` + `backend/`。
- 更新所有脚本、部署与反向代理配置引用，确保本地开发与部署均正常。

## 操作步骤
1. 停止当前后端相关命令
- 停止运行中的后端开发与 Prisma Studio 终端（避免重命名时占用文件句柄）。

2. 重命名目录与同步引用
- 将 `api/` 整体移动为 `backend/`。
- 更新根 `package.json` 脚本：用 `dev:backend` 取代 `dev:api`。
- 更新根 `docker-compose.yml`：服务名改为 `backend`，`build` 上下文从 `./api` 改为 `./backend`，端口与环境变量保持一致。
- 更新 `deploy/docker-compose.yml`：服务名改为 `backend`，`context` 改为 `./backend`，并将 Dockerfile 路径改为 `deploy/backend/Dockerfile`。
- 复制 `deploy/api/Dockerfile` 为 `deploy/backend/Dockerfile`（内容不变），未来统一使用 `deploy/backend/Dockerfile`。
- 更新 `deploy/nginx/nginx.conf`：`upstream api_upstream` 改为 `backend_upstream`，指向 `backend:5500`，`proxy_pass` 维持 `/api` 前缀（Nest 的全局前缀不变）。

3. 启动并验证
- 从 `backend/` 运行后端开发服务。
- 从 `frontend/` 运行前端开发服务。
- 验证浏览器端到端：登录、取词、评估、掌握列表。

4. 文档同步
- 更新 `README.md` 说明为 `frontend/` + `backend/` 的结构与启动方式。

## 风险与处理
- 重命名后若有路径遗漏导致构建失败，逐项修正引用（脚本、Compose、NGINX）。
- 端口与路由前缀不变，避免影响前端接口调用。

## 交付
- 完整的 `frontend/` + `backend/` 文件结构
- 更新后的脚本与部署配置
- 已验证正常运行的本地开发环境
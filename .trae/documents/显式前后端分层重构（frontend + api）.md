## 现状与问题
- 后端已明确位于 `api/`（NestJS），端口与代理统一到 `5500`。
- 旧的 `server/` 已移除，避免与 `/api` 前缀冲突。
- 前端仍置于仓库根目录，命名不够直观，导致“没有明显 frontend/backend”观感。

## 目标
- 将前端显式迁移到 `frontend/` 目录，与后端 `api/` 并列，形成清晰的前后端结构。
- 保持本地与部署流程不变或更清晰；不在前端暴露任何服务端密钥。

## 具体实施步骤
1. 目录重组（仅移动前端相关文件到 `frontend/`）
- 移动：`App.tsx`、`index.tsx`、`index.html`、`components/`、`pages/`、`router/`、`services/`、`contexts/`、`types.ts`、`data/`、`vite.config.ts`、`tsconfig.json`、`package.json`（前端的）。
- 保留：`api/`、`deploy/`、根级文档与编排文件（`README.md`、根级 `docker-compose.yml`）。

2. 配置调整
- 前端 `vite.config.ts`：更新别名 `@` 指向 `frontend` 根或 `src`（与现有导入保持兼容）。
- 根级启动脚本：新增工作区脚本，便于一键启动：
  - `npm run dev:frontend` → `npm --prefix frontend run dev`
  - `npm run dev:api` → `npm --prefix api run dev`
  - `npm run dev` → 并发启动两者（可选）。
- 部署：调整 `deploy/frontend/Dockerfile` 与 `deploy/docker-compose.yml` 的构建上下文为 `./frontend`（原配置已支持，但需同步更新上下文路径）。

3. 代码一致性与清理
- 恢复并统一 `App.tsx` 的路由壳（此前为排错引入的占位输出，会还原为 `BrowserRouter + AppProvider + 路由`）。
- 校对 `services/geminiService.ts`、`contexts/AppContext.tsx` 等相对路径在迁移后仍正确。

4. 文档更新
- 更新 `README.md`：明确前端在 `frontend/`、后端在 `api/`，本地与部署命令、端口与代理说明。

5. 验证
- 本地：分别启动 `api` 与 `frontend`，通过浏览器验证登录、学习、评估与“掌握列表”全链路。
- 部署：检查 `deploy/nginx/nginx.conf` 与容器端口映射仍指向 `/api:5500`，前端静态文件正常。

## 风险与回滚
- 文件移动会影响少量相对导入；迁移后逐一校验并修正。
- 如需回滚，只需将 `frontend/` 内容移回根目录，并恢复原启动脚本。

## 交付物
- 明确的仓库结构：`/frontend`（Vite + React）与 `/api`（NestJS）。
- 更新后的启动脚本与部署上下文。
- 通过验证的前端页面与后端接口。
## 问题概述
- 当前登录/注册请求本身能返回令牌，但随后访问受保护接口（例如 `/api/me`）返回 401，前端触发 `forceLogout` 导致看起来“无法正常登录”。

## 根因分析
- 后端签发与校验令牌使用了不一致的默认密钥：
  - 签发位置：`backend/src/modules/auth/auth.service.ts:12-15` 使用 `process.env.JWT_SECRET || 'dev_secret'`
  - 校验位置：`backend/src/common/jwt.guard.ts:12` 使用 `process.env.JWT_SECRET || 'change_me'`
- 在本地未设置 `JWT_SECRET` 时，访问令牌用 `'dev_secret'` 签发，但用 `'change_me'` 校验，导致所有受保护接口返回 401。
- 前端在 `frontend/services/geminiService.ts:96-102` 请求 `/api/me` 时收到 401 会调用 `forceLogout`，`AppContext` 监听该事件后清空 `token`，最终用户被强制退出，表现为登录/注册失败。

## 修复方案
- 统一后端 JWT 密钥读取逻辑，保证签发与校验一致：
 1) 修改 `backend/src/common/jwt.guard.ts:12` 的默认值为 `'dev_secret'`，与签发端保持一致：
   - 变更为：`jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')`
 2) 建议在本地 `.env` 显式设置 `JWT_SECRET=<你的随机密钥>`，避免依赖默认值（生产环境亦应强制设置）。
- 仅此更改即可恢复登录/注册后访问受保护接口的成功返回。

## 可选增强（若你同意一并处理）
- 强化刷新令牌校验：`backend/src/modules/auth/auth.service.ts:38-49` 目前只按 `userId` 查找刷新令牌，未比对具体 token；建议按 `tokenHash` 精确匹配并保存哈希值。
- 为 Nest 应用启用 CORS（如果将来不通过同源代理）：在 `backend/src/main.ts` 启用 `app.enableCors({...})`；当前 Vite 通过 `/api` 代理到 `5500`，暂不影响。

## 验证步骤
- 开发环境已通过 Vite 代理到后端：`frontend/vite.config.ts:12` 指向 `http://localhost:5500`。
- 修改后执行如下用例验证：
  - 注册新用户：在登录页切换到注册，成功后 `localStorage` 出现 `linguaCraft_token` 与 `linguaCraft_refresh`；`/api/me` 返回用户 `id/email`。
  - 使用已注册账户登录：登录后路由跳回来源页，`AuthGuard` 允许进入受保护页面；页面顶端不再出现强制退出。
  - 访问学习接口：`/api/learning/words`、`/api/learning/evaluate` 正常，未再出现 401 强退。
  - 退出登录：调用 `/api/auth/logout` 成功，前端清理本地令牌与上下文。

## 风险与兼容性
- 如果之前后端守卫默认 `'change_me'` 已发出任何可用令牌，它们会在修复后失效（本地一般没有此情况）。统一为 `'dev_secret'` 后与签发端一致，不会再出现 401。
- 若环境已设置 `JWT_SECRET`，本次修改不改变行为，只是对默认值对齐。

请确认是否按上述方案修复并是否一并进行可选增强；确认后我将执行修改并自检。
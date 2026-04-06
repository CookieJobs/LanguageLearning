# Tasks
- [x] Task 1: 后端 DebugModule 实现
  - [x] SubTask 1.1: 创建 `backend/src/modules/debug/debug.module.ts`, `debug.controller.ts`, `debug.service.ts`。
  - [x] SubTask 1.2: 实现 `POST /debug/reset-progress` (清空进度), `POST /debug/set-word-stage` (修改单词阶段和复习时间), `POST /debug/pet` (修改宠物状态)。
  - [x] SubTask 1.3: 在 `AppModule` 中注册 `DebugModule` (建议仅在非生产环境生效，或通过简单的 token 保护)。
- [x] Task 2: 前端 DebugPage 页面开发
  - [x] SubTask 2.1: 创建 `frontend/pages/DebugPage.tsx`，包含简单的表单用于输入单词、选择阶段、调整宠物数值。
  - [x] SubTask 2.2: 在 `frontend/App.tsx` 中注册 `/debug` 路由。
  - [x] SubTask 2.3: 添加快捷入口（如在设置页底部的版本号连续点击5次进入，或直接通过 URL 访问）。
- [x] Task 3: 联调与测试
  - [x] SubTask 3.1: 验证通过 DebugPage 修改单词阶段后，主页复习任务是否立即刷新出对应的题型（填空/造句）。
  - [x] SubTask 3.2: 验证修改宠物经验后，主页是否能正确触发升级逻辑。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]

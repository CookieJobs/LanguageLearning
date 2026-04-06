# Tasks
- [x] Task 1: 升级后端进度分析 API
  - [x] SubTask 1.1: 在 `progress.service.ts` 中重构计算逻辑，结合 `UserWordProgress` 表，计算并返回 `learning` (Stage 1-2), `new` (未学习), `toReview` (到期未复习), `struggling` (错误率高的词汇) 的数量。
  - [x] SubTask 1.2: 如果用户请求详情，支持按类别返回具体的单词列表。
- [x] Task 2: 升级前端 API 服务和类型定义
  - [x] SubTask 2.1: 更新 `frontend/types/index.ts` 中的 Progress 接口。
  - [x] SubTask 2.2: 修改 `frontend/services/geminiService.ts` 中的 API 调用逻辑。
- [x] Task 3: 实现主页多维进度可视化组件
  - [x] SubTask 3.1: 创建一个新的组件 `DashboardProgress`，实现加载中骨架屏和空状态占位。
  - [x] SubTask 3.2: 使用 SVG 或 Tailwind 实现环形进度条或多段进度条，展示不同维度的比例，并添加加载动画。
- [x] Task 4: 实现进度详情下钻功能
  - [x] SubTask 4.1: 创建 `ProgressDetailsModal` 组件，用于展示某一分类（如“待复习”）的具体单词列表。
  - [x] SubTask 4.2: 在 `DashboardProgress` 中绑定点击事件以触发该 Modal。
- [x] Task 5: 页面集成与联调
  - [x] SubTask 5.1: 将新组件集成到 `HomePage.tsx` 中，替换原有的简单进度条，确保响应式布局完美适配。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 4]

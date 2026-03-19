# 需求规格说明书 - 移除首页冗余组件

## 1. 背景
用户反馈 `HomePage` 中的“连续坚持”（Streak）卡片功能与顶部导航栏中的功能重复。为了简化界面，减少信息冗余，需要移除该卡片。

## 2. 目标
- **移除组件**：从 `HomePage` 中删除显示 Streak 信息的卡片组件。
- **布局调整**：清理因移除组件而不再需要的布局容器（如 Grid），确保页面布局依然整洁。

## 3. 详细需求
### 3.1 移除 Streak Card
- 删除包含“连续坚持”文本和火焰图标的 `Card` 组件。
- 移除包裹该 Card 的 `div.grid` 容器。

### 3.2 布局优化
- 原本的 Hero Banner 下方是 Stats Grid（仅剩 Streak Card）和 DashboardProgress。
- 移除 Stats Grid 后，DashboardProgress 应直接位于 Hero Banner 下方，保持垂直间距（gap）。
- 确保 `DashboardProgress` 的显示效果不受影响。

## 4. 交互逻辑
- 无新增交互，纯粹的 UI 简化。

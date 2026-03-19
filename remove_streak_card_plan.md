# 移除计划 - 移除首页冗余组件

## 第一步：修改 HomePage.tsx
1. 打开 `frontend/pages/HomePage.tsx`。
2. 定位到 `{/* Stats Grid */}` 注释块。
3. 删除包含 Streak Card 的整个 `div` 块（class="grid grid-cols-1 gap-5"）。
4. 确认 `DashboardProgress` 的容器是否有足够的上边距（目前是通过父容器 `flex flex-col gap-6 lg:gap-8` 控制的，所以应该不需要额外调整）。
5. 清理未使用的 import（如 `Flame` 图标）。

## 第二步：验证
1. 检查代码编译是否通过。
2. 确认 UI 变更符合预期。

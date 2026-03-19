# 合并计划 - 学习进度组件

## 第一步：增强 DashboardProgress 组件
1. 修改 `frontend/components/DashboardProgress.tsx`。
2. 引入 `ChevronRight` 图标。
3. 更新 `DashboardProgressProps` 接口，增加 `onClick?: () => void`。
4. 修改组件返回的 `Card`：
   - 传递 `onClick` 和 `hoverable`（当 `onClick` 存在时为 true）。
   - 在标题栏渲染 `ChevronRight`（当 `onClick` 存在时）。
5. 拦截内部点击事件：
   - 创建辅助函数 `handleCategoryClick(e: React.MouseEvent, category: string)`，在其中调用 `e.stopPropagation()` 和 `onCategoryClick(category)`。
   - 将所有原本直接调用 `onCategoryClick` 的地方替换为该辅助函数。

## 第二步：更新 HomePage 页面
1. 修改 `frontend/pages/HomePage.tsx`。
2. 找到并删除“Contextual Progress Card”的 JSX 代码块（约第 116-153 行）。
3. 调整布局结构：
   - 原本的布局是 `grid grid-cols-1 sm:grid-cols-2` 包含 Streak Card 和 Contextual Card。
   - 修改为：保留 Streak Card，并在其后（或同一容器内）放置 `DashboardProgress`。
   - 考虑到 `DashboardProgress` 较宽，可能需要将其移出该 `grid`，或者调整 `grid` 为单列（在移动端），或让 `DashboardProgress` 独占一行。
   - 建议方案：将 Streak Card 和 DashboardProgress 垂直排列，或者根据屏幕宽度调整。鉴于 Streak Card 很小而 DashboardProgress 较大，可以将 Streak Card 放在 DashboardProgress 上方，或者让它们并排（如果空间允许）。
   - 简单起见，可以将 Streak Card 保持原样，将 DashboardProgress 放在原来的位置，并让其占据合适的宽度（例如 `col-span-2` 如果是在大网格中，或者在该局部网格中独占一行）。
   - **最终决定**：将原本包含 Streak Card 和 Contextual Card 的 `div`（第 102 行）改为 `flex flex-col gap-5`，让它们垂直堆叠。或者保留 grid 但让 DashboardProgress 占据两列（如果是在大布局中）。
   - 实际上，HomePage 的主布局是：左栏（Hero + Stats Grid + DashboardProgress），右栏（Pet）。
   - 既然删除了 Contextual Card，原本的 Grid 只剩 Streak Card。
   - 我们可以将 Streak Card 和 DashboardProgress 作为兄弟元素直接放在左栏容器中。
4. 将 `DashboardProgress` 的 `onClick` 属性设置为 `() => navigate('/review')`。

## 第三步：验证
1. 运行应用，检查行为。

# 方案：整合学习进度组件

## 概述

将“上下文进度卡片”（旧组件）的视觉风格（如奖杯图标、大号数字展示）和交互功能（点击跳转复习）整合进“仪表盘进度组件”（新组件），并从主页移除旧卡片以优化界面布局。

## 当前状态分析

* **HomePage.tsx**：包含两个进度展示区域：

  1. 位于网格中的小卡片（与打卡卡片并列），显示“已掌握/总数”、奖杯图标，点击跳转 `/review`。
  2. 位于网格下方的大型 `DashboardProgress` 组件，展示详细的分段进度条和操作卡片。

* **DashboardProgress.tsx**：功能完善的分段进度组件，但缺乏旧卡片的精致视觉头部设计。

## 变更方案

### 1. 更新 `frontend/components/DashboardProgress.tsx`

* **新增 Props**：

  * `contextLabel` (string)：用于显示“当前教材”或“当前学段”标签。

  * `onHeaderClick` (function)：用于处理头部点击事件。

* **头部重设计**：

  * 引入 `Trophy`, `ChevronRight` 图标。

  * 替换现有的简单标题，复用旧卡片的布局：

    * 左侧：渐变背景的奖杯图标。

    * 中间/右侧：大号字体的“已掌握 / 总数”显示。

    * 副标题：“学习进度”字样及 `contextLabel` 徽章。

    * 交互：悬停时显示的 `ChevronRight` 图标。

* **交互绑定**：将头部区域的点击事件绑定到 `onHeaderClick`。

### 2. 更新 `frontend/pages/HomePage.tsx`

* **布局清理**：

  * 移除旧的 `Contextual Progress Card` 代码块。

  * 调整“打卡卡片 (Streak Card)”的布局容器。由于网格少了一个元素，可以将打卡卡片改为全宽显示，或者调整为垂直堆叠布局。

* **组件集成**：

  * 向 `DashboardProgress` 传递必要参数：

    * `contextLabel`：根据是否有选定教材显示对应文案。

    * `onHeaderClick`：绑定跳转 `/review` 的逻辑。

## 验证计划

* **视觉检查**：确保新版 `DashboardProgress` 的头部与旧卡片风格一致（奖杯、颜色、字体）。

* **功能检查**：

  * 点击头部区域应能跳转至 `/review` 页面。

  * 点击进度条分段/操作卡片应仍能打开 `ProgressDetailsModal` 弹窗。

  * “打卡卡片”在新的布局中显示正常（如全宽显示）。


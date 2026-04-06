# Dashboard Progress Widget Spec

## Why
随着单词掌握系统复杂度的提升，目前主页（Home Page）上单一的“已掌握 / 总词数”进度条已经无法全面反映用户的真实学习状态。用户需要更直观、多维度的数据展示（例如正在学习、待复习、高频错误词汇等），以更好地了解自己的学习情况，从而制定后续的学习计划，并获得成就感。

## What Changes
- **后端 API 扩展**：
  - 升级 `GET /api/learning/progress` 接口（或新增分析接口），返回更详细的阶段数据：`mastered` (Stage 3), `learning` (Stage 1-2), `new` (Stage 0), `toReview` (nextReviewAt <= now), `struggling` (高错误率/频繁重置词汇)。
- **前端数据层**：
  - 扩展 `fetchProgress` 方法和相关的 TS 接口定义以支持多维度数据。
- **前端组件重构 (Progress Widget)**：
  - 废弃原有的单线进度条。
  - 引入可视化图表组件（推荐使用环形进度条组合或阶梯进度图）来展示 `已掌握`、`学习中`、`待复习`、`困难词汇`。
  - 支持动画过渡效果（使用现有的 Tailwind 或 CSS 动画）。
  - 提供数据加载状态骨架屏（Skeleton）和空数据状态占位图。
  - 支持响应式布局。
- **下钻功能**：
  - 点击进度组件的不同区域/类别，可展开或跳转查看对应的详细词汇列表（初期可通过 Modal 或抽屉实现）。

## Impact
- Affected specs: 主页学习进度展示 (Home Page Progress)
- Affected code:
  - `backend/src/modules/learning/learning.controller.ts` (API 更新)
  - `backend/src/modules/learning/progress.service.ts` (业务逻辑计算)
  - `frontend/services/geminiService.ts` (接口调用升级)
  - `frontend/pages/HomePage.tsx` (主页布局适配)
  - `frontend/components/` (新增多维进度图表组件、词汇列表下钻 Modal)

## ADDED Requirements
### Requirement: 多维度进度展示
系统应能在主页以可视化图表的形式展示用户的多维学习状态。

#### Scenario: 正常加载进度
- **WHEN** 用户进入主页且已加载完成
- **THEN** 系统展示环形图/分段条，包含：已掌握词汇、学习中词汇、待复习词汇，并在下方或侧边展示困难词汇（错误率高）的统计。

#### Scenario: 点击查看详情
- **WHEN** 用户点击“待复习”的图表区域或统计卡片
- **THEN** 弹出一个列表，展示当前需要复习的具体单词列表，允许用户直接开始复习。

## MODIFIED Requirements
### Requirement: 进度 API 响应结构
原 API 仅返回 `total` 和 `mastered`。新结构应包含各 Stage 的详细分布和复习状态。

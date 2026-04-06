# Optimize Learning Feedback Spec

## Why
目前在学习会话（Session）结束时，系统仅展示“已掌握的单词”（即达到最高等级 Stage 3 并完成造句测试的单词）。这导致用户在学习全新单词的关卡中，即使完成了所有的选择题或填空题，最后看到的成果也是“0个单词已掌握”。这种负面反馈会让学习者产生挫败感，缺乏成就感。我们需要在不改变现有 4 阶段 SRS（间隔重复算法）核心逻辑的前提下，优化学习成果的展示方式，认可用户在每个阶段的进步。

## What Changes
- 修改前端 `AppContext` 中统计单次学习会话数据的逻辑：不再仅仅收集 `sessionMastered`（已掌握），而是收集 `sessionProgressed`（取得进步的单词），并记录该单词在本次答题后达到的新阶段（Stage 1: 初识, Stage 2: 熟悉, Stage 3: 掌握）。
- 改造 `SessionSummary` 组件的 UI 展示：
  - 将原有的“掌握单词”标题修改为“学习成果”或“取得进步”。
  - 列表展示本次所有答对的单词。
  - 为每个单词添加对应的阶段标识（如：🌱 初识, 🌿 熟悉, 🌳 掌握），直观体现学习进度。
- 修改 `LearnPage`，在传递给 `SessionSummary` 时使用新的统计数据。

## Impact
- Affected specs: 学习结果展示 (Session Summary)、前端会话统计逻辑
- Affected code:
  - `frontend/contexts/AppContext.tsx` (扩展收集进度的逻辑)
  - `frontend/pages/LearnPage.tsx` (传递新的 props)
  - `frontend/components/SessionSummary.tsx` (UI 渲染升级)

## ADDED Requirements
### Requirement: 阶段性学习反馈
系统应该在每次学习会话结束后，展示所有取得进步的单词及其当前所处的熟悉度阶段，而不是仅展示最终掌握的单词。

#### Scenario: Success case - 学习新单词关卡
- **WHEN** 用户完成了一组全是新词的关卡（仅包含英译汉、汉译英等选择题）
- **THEN** 会话结算页面应显示“取得进步”的单词列表，并在每个单词旁显示“🌱 初识”徽章，而不是显示“掌握了 0 个单词”。

## MODIFIED Requirements
### Requirement: 单词状态收集逻辑
原来的逻辑仅在用户答对 `sentence` 类型的题目时记录该单词。现在的逻辑需要在用户答对任何类型的题目时，记录该单词并推断其新的阶段标识。
- Type = 'choice' -> 🌱 初识
- Type = 'quiz' -> 🌿 熟悉
- Type = 'sentence' -> 🌳 掌握

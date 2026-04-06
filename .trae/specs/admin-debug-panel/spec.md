# Admin Debug Panel Spec

## Why
目前用户想要测试单词学习的高级阶段（Stage 2 填空、Stage 3 造句）以及宠物形态变化等功能，需要等待真实的复习时间（1-7天）或积累大量的学习时长。这对于开发调试、测试验收以及用户体验新功能都造成了巨大的阻碍。我们需要一个内部的调试工具（Debug Panel），允许用户（开发者/测试者）直接修改账号数据，瞬间达到特定的测试状态。

## What Changes
- **后端 API 新增**：
  - 新增 `DebugModule`，包含一系列用于修改数据的后门接口。
  - `POST /api/debug/reset-review`: 将指定用户的所有待复习单词时间设为当前，强制触发复习。
  - `POST /api/debug/set-word-stage`: 将指定单词的阶段直接修改为 2 或 3，以便测试填空和造句题。
  - `POST /api/debug/pet`: 直接修改宠物的经验值、等级、能量等属性，触发形态进化。
  - `POST /api/debug/mock-user`: （可选）生成一个全新的测试账号，包含预设的进度数据。
- **前端页面新增**：
  - 新增 `/debug` 路由页面，仅在开发环境或通过特定入口访问。
  - 页面包含：
    - **学习进度控制**：一键“所有单词立即复习”、“指定单词晋级”。
    - **宠物状态控制**：滑动条调整经验值、等级，一键“满状态”。
    - **数据重置**：一键“清空当前账号进度”。

## Impact
- Affected specs: 无（这是纯新增的开发辅助功能）
- Affected code:
  - `backend/src/app.module.ts` (注册 DebugModule)
  - `backend/src/modules/debug/` (新增模块)
  - `frontend/App.tsx` (注册路由)
  - `frontend/pages/DebugPage.tsx` (新增页面)

## ADDED Requirements
### Requirement: 学习进度调试
系统应允许将用户的单词复习时间重置为 `now`，并将单词阶段强制设定为指定值。

#### Scenario: 测试造句题
- **WHEN** 用户在调试面板输入单词 "apple" 并选择 "Set Stage to 2 (Ready for Stage 3)"
- **THEN** 系统更新数据库，将 "apple" 的 `stage` 设为 2，`nextReviewAt` 设为过去时间。
- **AND** 用户回到主页开始学习时，第一题即为 "apple" 的造句题。

### Requirement: 宠物调试
系统应允许直接修改宠物的 `exp` 和 `level`。

#### Scenario: 测试进化
- **WHEN** 用户在调试面板将宠物等级设为 9，经验设为 99
- **THEN** 用户回到主页，随便完成一个任务，宠物应立即触发升级/进化动画。

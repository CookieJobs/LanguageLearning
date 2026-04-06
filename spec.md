# Z-Index 弹窗遮挡问题修复方案规格说明 (Specification)

## 1. 需求概述
在应用中，存在多个弹窗组件和导航栏（Header）等全局组件由于 `z-index` 值相近或相同（均为 `z-50`）而导致的遮挡问题。例如，用户在浏览器中选中的“待复习单词”弹窗（`ProgressDetailsModal.tsx`）和顶部的“LinguaCraft”导航栏（`Header.tsx`）均使用了 `z-50` 的层级，导致弹窗可能被导航栏遮挡。

## 2. 目标
解决项目中所有存在的弹窗被遮挡的问题，并检查和修复整个项目中潜在的被遮挡情况。

## 3. 技术设计
- **层级设计原则**：
  - 页面级常规布局（Header、Footer 等）的层级保持在 `z-40` 至 `z-50` 之间。
  - 全局级别的模态框（Modal）、弹窗（Dialog）、遮罩层（Overlay）统一提升到 `z-[100]` 或更高层级（例如 `z-[1000]`），确保它们始终显示在应用最顶层。

- **需修改的组件**：
  - `ProgressDetailsModal.tsx` (待复习单词等进度详情弹窗)
  - `StoryModal.tsx` (故事弹窗)
  - `SessionSummary.tsx` (会话总结弹窗)
  
- **已合规的组件** (无需修改)：
  - `SessionExpiredModal.tsx` (已有 `z-[100]`)
  - `CalendarModal.tsx` (已有 `z-[100]`)
  - `LoadingOverlay.tsx` (已有 `z-[1000]`)

## 4. UI/UX 效果
修复后，所有的全局弹窗将正确地覆盖在包括导航栏在内的其他页面内容之上，用户体验更加连贯，不再会出现点击区域被阻挡或视觉上产生割裂的现象。

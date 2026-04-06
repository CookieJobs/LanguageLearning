# 答题页面布局修改计划 (layout_change_plan)

## 1. 概述 (Summary)
用户希望将当前的答题页面从“左右结构”（左侧显示单词/问题，右侧显示选项/输入框和操作区）更改为“上下结构”。

## 2. 当前状态分析 (Current State Analysis)
答题页面的主要布局在 `frontend/components/LearningSession.tsx` 文件中定义。
- 容器使用 `flex-col md:flex-row`，在移动端是上下结构，但在桌面端（`md`及以上）会变成左右结构。
- 左侧区域（单词/问题展示）通过 `md:w-[38%] md:h-full border-r-4` 占据了桌面端 38% 的宽度并有右边框。
- 右侧区域（答题工作区）通过 `flex-1` 占据剩余的 62% 宽度，包含滚动内容区和底部的操作按钮。

## 3. 建议的修改 (Proposed Changes)
需要修改 `frontend/components/LearningSession.tsx` 中的 CSS 类，移除特定于桌面端的左右布局设置。

### 具体修改点：
**文件**: `frontend/components/LearningSession.tsx`

1. **主布局容器**:
   - 原代码: `<div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">`
   - 修改为: `<div className="flex flex-col flex-1 overflow-hidden relative">`
   - **原因**: 移除 `md:flex-row`，确保在所有屏幕尺寸下都保持垂直（上下）排列。

2. **顶部区域（原左侧栏）**:
   - 原代码: `<div className="w-full md:w-[38%] h-[32vh] md:h-full bg-duo-blue relative flex flex-col items-center justify-center p-6 md:p-8 text-white shadow-none z-10 border-r-4 border-[#1899d6]">`
   - 修改为: `<div className="w-full py-8 md:py-10 bg-duo-blue relative flex flex-col items-center justify-center px-6 md:px-8 text-white shadow-none z-10 border-b-4 border-[#1899d6] shrink-0">`
   - **原因**: 移除 `md:w-[38%]` 和 `md:h-full`。使用上下内边距 (`py-8 md:py-10`) 来适应内容高度，并将右边框 (`border-r-4`) 改为底边框 (`border-b-4`)，增加 `shrink-0` 避免在空间不足时被压缩。

3. **底部区域（原右侧栏）**:
   - 原代码: `<div className="flex-1 flex flex-col relative bg-white h-full">`
   - 修改为: `<div className="flex-1 flex flex-col relative bg-white overflow-hidden">`
   - **原因**: 移除 `h-full` 并添加 `overflow-hidden`，因为在 `flex-col` 的父级下，使用 `flex-1` 并配合 `overflow-hidden` 可以确保内部的滚动区域正常工作，不会超出父容器。

## 4. 假设与决策 (Assumptions & Decisions)
- **假设**: 答题区内部的组件（如 `SentenceQuestion` 和 `MultipleChoiceQuestion`）已经做了良好的响应式设计，能在全宽（最大宽度受限）的容器中正常显示。
- **决策**: 顶部区域的高度不再固定为全高，而是由其内容（如单词、音标按钮等）撑开，并添加适当的 `padding` 以保持视觉美观。这为下方的答题区域留出更多垂直空间。
- **决策**: 在执行阶段，除了修改代码，还会根据用户的规则生成 `spec.md`, `tasks.md`, `checklist.md` 规范文件。

## 5. 验证步骤 (Verification Steps)
1. 在浏览器中打开应用并进入答题学习页面。
2. 调整浏览器窗口宽度（从移动端到桌面端尺寸），确认页面始终保持上下结构。
3. 检查顶部蓝色区域的边框是否在底部（`border-b-4`）。
4. 确认底部答题区域可以正常滚动，且底部的“Skip”/“Check Answer”按钮固定在屏幕最下方。
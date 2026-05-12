# Z-Index 弹窗遮挡问题修复方案 (Fix Overlap Plan)

## 1. 问题背景
在项目中，由于弹窗组件和导航栏（Header）等全局组件的 `z-index` 都设置为了 `z-50`，导致在特定的 DOM 渲染顺序下，弹窗可能被导航栏遮挡（例如“待复习单词”弹窗被顶部“LinguaCraft”导航栏遮挡）。

## 2. 修复目标
将项目中所有全局全屏弹窗/遮罩（Modal/Overlay）组件的层级提高，统一设置为 `z-[100]` 或更高，以确保它们始终处于页面最顶层，不被 `Header` 等组件遮挡。

## 3. 修复范围
经过全局搜索 `fixed.*z-` 和 `absolute.*z-` 等层级样式，识别出以下需要修复的文件：
- `frontend/components/StoryModal.tsx`
- `frontend/components/ProgressDetailsModal.tsx` (即“待复习单词”弹窗)
- `frontend/components/SessionSummary.tsx`

同时确认了以下文件已经具有正确的超高层级，无需修改：
- `SessionExpiredModal.tsx` (`z-[100]`)
- `CalendarModal.tsx` (`z-[100]`)
- `LoadingOverlay.tsx` (`z-[1000]`)

## 4. 具体修改步骤
1. 定位到上述 3 个组件的根层级容器（`div.fixed.inset-0`）。
2. 将 `z-50` 替换为 `z-[100]`。
3. 验证确保弹窗能正常显示并覆盖在 `Header`（`z-50`）之上。

# Z-Index 弹窗遮挡修复任务列表

- [x] 搜索项目中带有 `待复习单词` 的弹窗组件，定位到 `ProgressDetailsModal.tsx`
- [x] 搜索并分析顶部的导航栏组件 `Header.tsx`
- [x] 比较两者的 `z-index` 设置，发现均设置为 `z-50`
- [x] 使用 `Grep` 全局检查其他具有相似层级的固定定位弹窗或遮罩层
- [x] 将 `StoryModal.tsx` 的弹窗层级从 `z-50` 提高到 `z-[100]`
- [x] 将 `ProgressDetailsModal.tsx` 的弹窗层级从 `z-50` 提高到 `z-[100]`
- [x] 将 `SessionSummary.tsx` 的弹窗层级从 `z-50` 提高到 `z-[100]`
- [x] 编写 `spec.md` 规格说明文件
- [x] 编写 `tasks.md` 任务列表文件
- [x] 编写 `checklist.md` 检查清单文件
- [x] 编写 `fix_overlap_plan.md` 修复方案文件

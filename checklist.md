# Z-Index 弹窗遮挡问题检查清单

- [x] 是否确认“待复习单词”弹窗 (`ProgressDetailsModal.tsx`) 的层级已被修改为 `z-[100]`？
- [x] 是否检查过顶部导航栏 (`Header.tsx`) 的 `z-index`，确认它的值为 `z-50` 且低于弹窗的 `z-[100]`？
- [x] 是否通过 `grep` 检查了整个项目中其他可能存在遮挡的模态弹窗（例如 `fixed.*z-50`）？
- [x] 确认以下其他组件的 `z-index` 已同步升级为 `z-[100]`：
  - `StoryModal.tsx`
  - `SessionSummary.tsx`
- [x] 是否已确认已有高层级的模态框（如 `LoadingOverlay.tsx`、`CalendarModal.tsx`）保持了正确的层级？
- [x] 所有的修改是否保持了代码的规范和组件内部原有其他类的完整性？
- [x] 是否生成了所有要求的文件 (`spec.md`、`tasks.md`、`checklist.md` 以及 `xxx_plan.md`) 并且使用中文书写？

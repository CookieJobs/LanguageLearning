# Tasks
- [x] Task 1: 更新前端 AppContext 的会话统计逻辑
  - [x] SubTask 1.1: 在 `AppContext.tsx` 中添加一个 `sessionProgressed` 状态（代替或配合 `sessionMastered`）。它的结构可以为 `{ word: string, stage: 'new' | 'familiar' | 'mastered' }[]`。
  - [x] SubTask 1.2: 在 `handleQuestionSuccess` 函数中，根据答对的题目类型（`choice`, `quiz`, `sentence`）来推断阶段，并将答对的单词及其阶段信息加入 `sessionProgressed` 列表（注意去重）。
- [x] Task 2: 改造 LearnPage 向 SessionSummary 传递数据的逻辑
  - [x] SubTask 2.1: 在 `LearnPage.tsx` 结束会话时，不再只传递 `sessionMastered` 列表，而是将新的 `sessionProgressed` 作为 `items` 传入 `SessionSummary` 组件。
- [x] Task 3: 优化 SessionSummary 组件的 UI 展示
  - [x] SubTask 3.1: 将原来的“掌握单词”相关的文案改为“学习成果”或“取得进步”。
  - [x] SubTask 3.2: 根据传入的 `items` 中的 stage 字段，在每个单词右侧渲染不同样式或带有表情符号的徽章（如：🌱 初识、🌿 熟悉、🌳 掌握）。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]

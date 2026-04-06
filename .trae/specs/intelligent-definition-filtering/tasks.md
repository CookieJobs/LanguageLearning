# Tasks

- [x] Task 1: 数据库 Schema 变更
  - [x] SubTask 1.1: 修改 `backend/src/modules/learning/vocab.schema.ts`，为 `VocabWord` 添加 `contextualDefinitions` 字段（数组结构，包含 `textbook`, `definition`, `example` 等）。

- [ ] Task 2: 上下文释义生成脚本 (AI)
  - [x] SubTask 2.1: 创建 `backend/scripts/generate-contextual-defs.ts`。
  - [x] SubTask 2.2: 实现逻辑：读取所有小学教材列表 -> 获取每本教材单词 -> 构造 Prompt 调用 DeepSeek API -> 解析返回结果 -> 更新数据库。
  - [x] SubTask 2.3: 包含断点续传和缓存机制（类似之前的 `import-elementary-vocab`），防止 API 中断。

- [x] Task 3: 释义优先返回逻辑实现
  - [x] SubTask 3.1: 修改 `VocabService` 中的查询方法（如 `pickWords`），支持传入 `textbook` 参数。
  - [x] SubTask 3.2: 实现“释义覆盖”逻辑：若 `contextualDefinitions` 中有匹配当前教材的条目，则覆盖默认 `definition` 和 `example`。

- [x] Task 4: 验证与测试
  - [x] SubTask 4.1: 运行生成脚本，为一本教材（如“人教版三年级起点三年级上”）生成数据。
  - [x] SubTask 4.2: 前端/API 测试：请求该教材的单词，确认返回的是 AI 生成的简化释义。

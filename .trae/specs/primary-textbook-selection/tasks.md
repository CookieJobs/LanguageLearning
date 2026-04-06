# Tasks

- [x] Task 1: 编写脚本将小学教材映射数据导入数据库
  - [x] SubTask 1.1: 在 `backend/scripts/` 下创建 `import-primary-textbooks.ts` 脚本。
  - [x] SubTask 1.2: 解析 `book.csv` 过滤出 `小学英语` 分类下的教材。
  - [x] SubTask 1.3: 解析 `relation_book_word.csv` 和 `word.csv`，获取教材包含的单词列表。
  - [x] SubTask 1.4: 更新 MongoDB 中 `VocabWord` 的 `textbooks` 数组，将小学教材名称追加进去。

- [x] Task 2: 后端 API 支持获取小学教材列表
  - [x] SubTask 2.1: 在 `backend/src/modules/learning/textbook.service.ts` 中新增逻辑，从数据库或静态配置中获取小学教材列表，并根据年级（1-6年级）进行分类或打标签。
  - [x] SubTask 2.2: 在 `LearningController` 中暴露获取小学教材列表的接口（或者复用现有的教材接口并支持通过 level 参数过滤）。

- [x] Task 3: 前端页面改造 (`LevelSelectPage.tsx`)
  - [x] SubTask 3.1: 当用户点击“小学”时，渲染“年级”选择区（一年级到六年级）。
  - [x] SubTask 3.2: 根据选中的年级，过滤并展示该年级对应的小学教材列表（如“人教版三年级起点三年级上”）。
  - [x] SubTask 3.3: 用户选择教材后，点击“完成选择”，将所选教材更新到用户 Profile。
  - [x] SubTask 3.4: 确保样式和动画（如 `animate-slide-down`）与现有的初中教材选择保持一致和美观。

- [x] Task 4: 验证学习内容
  - [x] SubTask 4.1: 在本地环境运行项目，选择一本小学教材（如“人教版三年级起点三年级上”）。
  - [x] SubTask 4.2: 进入学习页面，验证是否优先出现该教材内的单词。

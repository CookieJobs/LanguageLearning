# Primary Textbook Selection Spec

## Why
目前，用户在选择“小学”级别后，只能学习小学范围内的综合高频词汇。为了提供更贴合用户实际需求的学习体验，我们需要支持用户在选择“小学”后，能够进一步选择具体的“年级”以及具体的“教材版本”（如人教版三年级上册）。这样用户就可以直接针对他们正在学习的课本进行单词学习。

## What Changes
- **数据层 (Data)**: 编写脚本从 DictionaryData (`book.csv`, `word.csv`, `relation_book_word.csv`) 中提取小学教材及其包含的单词，并将教材名称更新到 MongoDB 中对应单词的 `textbooks` 字段。
- **接口层 (API)**: 提供一个 API 获取按年级分类的小学教材列表。
- **用户模型 (User Model)**: 用户的 `textbook` 字段目前已存在，可直接存储选中的小学教材名称。
- **前端页面 (UI)**: 
  - 修改 `LevelSelectPage.tsx`，当用户选择“小学”时，展开“年级选择”（一至六年级）。
  - 选择年级后，展开“教材选择”（如人教版、外研社版等）。
  - 保存用户选择并更新当前学习进度。
- **学习逻辑 (Learning Flow)**: `learning-scheduler` 已经支持优先推送 `textbooks` 包含用户所选教材的单词，此部分无需大改，只需确保数据库数据正确即可。

## Impact
- Affected specs: Level Selection, Vocabulary Import
- Affected code:
  - `frontend/pages/LevelSelectPage.tsx`
  - `backend/src/modules/learning/textbook.service.ts`
  - `backend/src/modules/learning/learning.controller.ts`
  - 新增 `backend/scripts/import-primary-textbooks.ts`

## ADDED Requirements
### Requirement: Primary Grade and Textbook Selection
The system SHALL provide a way for primary school learners to select their specific grade and textbook.

#### Scenario: Success case
- **WHEN** user selects "小学" on the level select page
- **THEN** they see options for Grades 1-6
- **WHEN** user selects "三年级"
- **THEN** they see a list of grade 3 textbooks (e.g. 人教版三年级上册)
- **WHEN** user selects a textbook and confirms
- **THEN** their profile is updated, and subsequent learning sessions will prioritize words from this textbook.

## MODIFIED Requirements
### Requirement: Textbook Service
The `TextbookService` currently reads Excel files from the `book/` directory. It MUST be updated to also serve the primary textbooks that are now stored in the database or parsed dynamically, so the frontend can retrieve them.

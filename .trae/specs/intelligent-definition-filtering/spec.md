# 基于教材的上下文释义映射系统 (Contextual Definition Mapping System) Spec

## Why
用户（学生）在不同年级和不同教材中学习同一个单词时，需要掌握的释义深度是不一样的。例如 "apple" 在一年级可能只学 "苹果"，但在高年级可能涉及更复杂的用法。
目前的原始数据（DictionaryData）仅提供全局统一的释义，缺乏针对特定教材的定制化释义。
因此，我们需要**通过 AI (DeepSeek) 批量生成**并存储“教材-单词-释义”的明确映射。这能确保学生在学习某本教材时，看到的就是该教材要求掌握的确切释义。

## What Changes
- **数据层 (Data)**:
  - 修改 `VocabWord` Schema，新增 `contextualDefinitions` 字段。
  - 结构示例：
    ```typescript
    contextualDefinitions: [
      {
        textbookId: "人教版三年级上", // 或 textbookName
        definition: "n. 苹果",
        example: "This is an apple."
      }
    ]
    ```
- **数据生成 (Generation)**:
  - 编写脚本 `scripts/generate-contextual-defs.ts`。
  - 逻辑：
    1. 遍历所有小学教材。
    2. 获取每本教材的单词列表。
    3. 调用 DeepSeek API，提示词示例：“请给出单词 'apple' 在《人教版三年级上册》语境下的简明中文释义和小学难度例句”。
    4. 将生成结果存入数据库的 `contextualDefinitions` 字段。
- **接口层 (API)**:
  - 修改学习接口（`pickWords`），接收 `textbook` 参数。
  - 逻辑：如果请求中包含 `textbook`，且该单词有对应的 `contextualDefinitions`，则**优先返回**该特定释义；否则返回默认全局释义。

## Impact
- Affected specs: Vocabulary Schema, Learning Session
- Affected code:
  - `backend/src/modules/learning/vocab.schema.ts`
  - `backend/src/modules/learning/vocab.service.ts`
  - 新增生成脚本

## ADDED Requirements
### Requirement: AI-Generated Contextual Definitions
The system SHALL use AI to generate and store simplified definitions and examples for words based on their specific textbook context.

#### Scenario: Generation
- **WHEN** the generation script runs for "人教版三年级上"
- **THEN** it generates simple definitions for all words in that book and saves them to the database.

### Requirement: Textbook-Specific Definition Lookup
The system SHALL retrieve these specific definitions when a user is learning from that textbook.

## MODIFIED Requirements
### Requirement: Vocabulary API
The vocabulary retrieval API MUST accept an optional `textbook` parameter and prioritize returning the context-specific definition if available.

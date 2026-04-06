# 数据入库与质量保障方案 (Data Import & Quality Assurance Plan)

## 摘要
为确保新获取的小学词汇数据 (`data/processed/elementary_vocabulary.json`) 能够安全、有效地整合到现有系统中，我们将实施一套稳健的数据入库方案。鉴于现有数据库 Schema 的严格性以及用户对数据质量的高标准要求，本方案将采用 **AI (DeepSeek) 辅助补全** 的策略，即通过调用 DeepSeek API 批量生成高质量例句，以满足 Schema 的必填要求并提升学习体验。

## 现状分析 (Current State Analysis)
- **数据源**: `data/processed/elementary_vocabulary.json` 包含约 3500 个单词，核心字段为：`word`（单词）, `phonetic`（音标）, `definition`（英文释义）, `translation`（中文释义）, `tags`（标签）, `collins`（柯林斯星级）, `oxford`（牛津分级）。
- **数据库 Schema**: 后端 `VocabWord` (Mongoose) 目前要求 `exampleEn`（英文例句）, `cefr`（分级）, `pos`（词性）等字段为必填项。
- **差异 (Gap)**: 源数据缺少明确的 `exampleEn` 字段，且 `pos` 和 `cefr` 需要从其他字段推导。

## 建议变更 (Proposed Changes)

### 1. 数据库 Schema 保持 (Schema Strictness)
- **文件**: `backend/src/modules/learning/vocab.schema.ts`
- **决策**: 保持 `exampleEn`, `cefr`, `pos` 为必填项。
- **新增**: 仅新增 `source` 字段以追踪数据来源（例如：'ecdict', 'manual', 'ai-generated'）。

### 2. 增强型导入逻辑实现 (Enhanced Import Logic)
- **新脚本**: `backend/scripts/import-elementary-vocab.ts`
- **功能特性**:
    - **数据转换**:
        - 映射 `word` -> `headword` & `lemma`。
        - 从 `definition` 或 `translation` 中提取 `pos`（例如 "n." -> "noun"）。
        - 根据 `tags`（如 'zk' -> 'A2'）或 `collins` 星级推导 `cefr` 等级。
    - **数据补全 (AI-Powered Enrichment)**:
        - **例句生成**: 
            - 使用 DeepSeek API (OpenAI 兼容模式) 批量生成符合小学难度（CEFR A1/A2）的英文例句。
            - 脚本将包含断点续传机制，防止 API 中断导致进度丢失。
            - 生成结果将先缓存到本地文件 (`data/processed/elementary_examples.json`)，确认无误后再入库。
        - **默认值**: 对于无法推导的 CEFR，默认为 'A1'。
    - **数据验证**: 使用 `class-validator` 在入库前确保数据完整性。
    - **批量处理**: 使用 `bulkWrite` 进行高效的 upsert（更新或插入）操作。
    - **异常处理**: 捕获并记录无效条目，确保单条错误不中断整个导入过程。

### 3. 数据质量监控
- **日志记录**: 导入脚本将生成详细报告 (`data/processed/import_report.log`)，内容包括：
    - 处理的总记录数。
    - 成功/失败的条数。
    - AI 生成例句的成功率。
    - 跳过单词的列表及原因（如“无法提取词性”）。
    - 推导出的 CEFR 等级分布统计。

### 4. 测试策略
- **单元测试**: `backend/scripts/import-vocab.spec.ts` 验证转换逻辑（如 POS 提取、CEFR 映射是否正确）。
- **集成测试**: 验证数据是否成功持久化到数据库，以及查询性能。
- **性能测试**: 测量 3500 个单词的导入耗时（不含 AI 生成时间）。

### 5. 文档更新
- 更新 `backend/README.md`，添加导入脚本的使用说明和 DeepSeek API 配置要求。

## 验证计划 (Verification Plan)
1. **Schema 检查**: 确认 `VocabWord` Schema 未被放宽。
2. **AI 生成测试**: 抽取 10 个单词测试 DeepSeek 生成例句的质量和速度。
3. **试运行 (Dry Run)**: 在 dry-run 模式下运行导入脚本，检查数据转换和补全逻辑是否符合预期。
4. **执行导入**: 运行导入脚本并检查 `import_report.log`。
5. **数据核对**: 查询 MongoDB，确认新单词已正确插入且必填字段（如 `exampleEn`）均有值。
6. **前端检查**: 确保 App 端能够正常显示这些单词及其高质量例句。

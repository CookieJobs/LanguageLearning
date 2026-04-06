# 小学英语常用单词数据源调研与构建 Spec

## Why
为了支持小学英语教学产品的功能开发，我们需要一个高质量、结构规整且易于导入的单词库。该词库应覆盖小学1-6年级的常用词汇，包含单词、音标、释义等核心字段。

## What Changes
我们将采用 **"ECDICT 为主，DictionaryData 为辅"** 的策略来构建词库：
1.  **数据源引入**：
    *   **底层库 (Base Layer)**: 使用 `skywind3000/ECDICT` (MIT 协议) 作为主数据源，提供详细的音标、释义和词形变化数据。
    *   **索引源 (Index Source)**: 使用 `LinXueyuanStdio/DictionaryData` 中的小学英语词汇表作为索引，确定单词范围。
2.  **数据处理**：
    *   编写 Python 脚本 `scripts/generate_vocabulary.py`。
    *   脚本负责读取索引源中的单词列表。
    *   脚本在底层库中查询详细信息。
    *   进行数据清洗（去重、格式统一）。
3.  **输出产物**：
    *   生成 `data/processed/elementary_vocabulary.json` 文件，供前端或后端导入使用。

## Impact
-   **Affected Specs**: 无直接影响，是新功能的数据基础。
-   **Affected Code**:
    -   新增 `data/raw/` 目录用于存放原始数据。
    -   新增 `data/processed/` 目录用于存放处理后的数据。
    -   新增 `scripts/generate_vocabulary.py` 用于数据处理。

## ADDED Requirements

### Requirement: Data Source Integration
系统 SHALL 能够从指定的开源仓库获取并解析单词数据。

#### Scenario: Data Fetching
-   **WHEN** 运行数据获取脚本
-   **THEN** 系统应自动下载或读取 `ECDICT` 和 `DictionaryData` 的源文件。

### Requirement: Vocabulary Filtering & Mapping
系统 SHALL 根据小学词汇表过滤底层库数据，并映射关键字段。

#### Scenario: Word Matching
-   **WHEN** 索引源中存在单词 "apple"
-   **THEN** 系统应从 ECDICT 中提取 "apple" 的音标、释义。
-   **AND** 若 ECDICT 中存在多个释义，应优先提取最常用的（或全部提取供后续人工筛选）。

#### Scenario: Data Structure
生成的 JSON 对象应包含以下字段：
-   `word`: 单词拼写 (string)
-   `phonetic`: 音标 (string, 优先美式)
-   `definition`: 中文释义 (string)
-   `translation`: 简明翻译 (string, 可选)
-   `tags`: 标签 (array, e.g., ["小学", "人教版"])

## MODIFIED Requirements
无。

## REMOVED Requirements
无。

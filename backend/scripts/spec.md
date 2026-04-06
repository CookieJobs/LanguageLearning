# 自动化教材词汇上下文定义生成 (generate-contextual-defs.ts)

## 1. 目标
修改 `generate-contextual-defs.ts` 脚本，使其能够自动读取 `primary_textbooks.json` 中配置的所有小学教材列表，并遍历这些教材为数据库中的相关单词调用 DeepSeek API 生成符合该年级水平的中文释义（definitionZh）和英文例句（exampleEn），最终同步到数据库的 `contextualDefinitions` 字段中。

## 2. 现状问题
当前 `generate-contextual-defs.ts` 的 `main` 函数中，硬编码了只处理 `"人教版三年级起点三年级上"` 这一本教材，虽然代码中有一段被注释掉的遍历所有教材的逻辑，但并未实际执行。为了全量生成例句，需要将其改造为自动遍历所有教材。

## 3. 功能需求
- **全量遍历**: 读取 `data/processed/primary_textbooks.json` 文件中的所有教材名称数组。
- **进度显示**: 在控制台输出明确的进度信息（例如 `[1/151] 正在处理: XXX`）。
- **错误隔离**: 使用 `try-catch` 包裹单个教材的处理逻辑，如果某本教材处理失败（如网络错误），不应导致整个脚本崩溃，而是记录错误并继续处理下一本。
- **状态持久化**: 依赖现有的 `contextual_defs_cache.json` 缓存机制，确保脚本中断后重新运行可以跳过已处理的单词，节省 API 调用和时间。

## 4. 数据依赖
- **输入数据源**: 
  - `MongoDB (VocabWord)`: 数据库中的单词信息。
  - `data/processed/primary_textbooks.json`: 需要处理的教材列表。
- **输出/更新目标**:
  - `data/processed/contextual_defs_cache.json`: 本地缓存文件。
  - `MongoDB (VocabWord.contextualDefinitions)`: 数据库中单词的上下文释义字段。

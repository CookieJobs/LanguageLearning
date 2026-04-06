# Checklist

- [x] **目录结构**
    - [x] `data/raw/ECDICT` 存在且包含 csv 文件。
    - [x] `data/raw/DictionaryData` 存在且包含小学词汇源文件。
    - [x] `data/processed` 目录存在。

- [x] **脚本功能**
    - [x] `scripts/generate_vocabulary.py` 能够成功运行无报错。
    - [x] 脚本能够正确读取并解析源文件。

- [x] **数据质量**
    - [x] 生成的 `elementary_vocabulary.json` 文件存在。
    - [x] JSON 格式合法（通过 `json.load` 验证）。
    - [x] 数据量合理（小学词汇通常在 500-2000 词之间）。
    - [x] 关键字段检查：所有条目均包含 `word` 和 `definition`。
    - [x] 抽样检查：单词 "apple" 的音标和释义正确。

- [x] **文档**
    - [x] `data/README.md` 包含数据来源说明和脚本使用方法。

- [x] **高频词库完整性**
    - [x] `data/raw/ECDICT/stardict.csv` 文件存在且大小合理（>100MB）。
    - [x] 重新生成的 `elementary_vocabulary.json` 中，大部分单词包含完整的 `phonetic`, `definition`, `collins`, `oxford` 字段。

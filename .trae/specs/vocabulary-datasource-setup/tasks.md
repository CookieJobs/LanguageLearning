# Tasks

- [x] Task 1: 准备工作区与依赖
    - [x] SubTask 1.1: 创建目录结构 `data/raw` (存放原始数据) 和 `data/processed` (存放结果)。
    - [x] SubTask 1.2: 确认 Python 环境及必要的库 (如 `pandas` 如果需要，或仅使用标准库 `csv`, `json`)。

- [x] Task 2: 获取原始数据
    - [x] SubTask 2.1: 下载 `skywind3000/ECDICT` 的 `ecdict.csv` (或其精简版 `stardict.csv`) 到 `data/raw/ECDICT/`。
    - [x] SubTask 2.2: Clone 或下载 `LinXueyuanStdio/DictionaryData` 仓库，提取小学相关词汇文件到 `data/raw/DictionaryData/`。

- [x] Task 3: 编写数据处理脚本
    - [x] SubTask 3.1: 创建脚本 `scripts/generate_vocabulary.py`。
    - [x] SubTask 3.2: 实现读取 `DictionaryData` 中小学词汇列表的功能（解析 JSON/CSV）。
    - [x] SubTask 3.3: 实现读取 `ECDICT` CSV 文件的功能，构建哈希表以快速查找。
    - [x] SubTask 3.4: 实现数据合并逻辑：遍历小学词汇，从 ECDICT 提取详情，处理字段映射。
    - [x] SubTask 3.5: 实现数据清洗：去除重复词、处理空值、格式化音标和释义。
    - [x] SubTask 3.6: 将处理后的数据导出为 `data/processed/elementary_vocabulary.json`。

- [x] Task 5: 补充下载完整的高频词库并重新生成
    - [x] SubTask 5.1: 从 ECDICT Release 下载 `stardict.csv.zip` 并解压到 `data/raw/ECDICT/stardict.csv`。
    - [x] SubTask 5.2: 修改 `scripts/generate_vocabulary.py` 以支持读取 `stardict.csv`，并提取 `collins` 和 `oxford` 字段。
    - [x] SubTask 5.3: 重新运行脚本，生成包含完整音标、释义和高频标记的 `elementary_vocabulary.json`。

#!/usr/bin/env python3
import json
import random
from typing import List, Dict

# CEFR 级别定义
CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"]
WORDS_PER_LEVEL = 20  # 每个级别生成20个单词，总共100个

# 主题分类
TOPICS = {
    "school": ["classroom", "teacher", "student", "homework", "exam", "lesson", "grade", "subject"],
    "daily": ["family", "food", "house", "weather", "time", "money", "work", "health"],
    "learning": ["study", "practice", "read", "write", "listen", "speak", "learn", "remember"],
    "grammar": ["noun", "verb", "adjective", "adverb", "tense", "sentence", "phrase", "clause"],
    "science": ["experiment", "research", "theory", "method", "data", "result", "analysis", "conclusion"],
    "academic": ["essay", "thesis", "argument", "evidence", "source", "citation", "plagiarism", "reference"],
    "math": ["number", "equation", "graph", "statistic", "probability", "geometry", "algebra", "calculus"],
    "society": ["culture", "tradition", "custom", "law", "government", "economy", "environment", "technology"],
    "business": ["company", "market", "product", "service", "customer", "profit", "strategy", "management"],
    "law": ["contract", "agreement", "regulation", "policy", "right", "duty", "court", "judge"]
}

# 学习阶段
LEVELS = ["Primary", "Middle", "High", "University", "Professional"]

# 词性
PARTS_OF_SPEECH = ["noun", "verb", "adjective", "adverb", "preposition", "conjunction"]

# 基础词汇库（按CEFR级别）
BASE_VOCAB = {
    "A1": [
        {"word": "hello", "pos": "interjection", "zh": "你好"},
        {"word": "goodbye", "pos": "interjection", "zh": "再见"},
        {"word": "please", "pos": "adverb", "zh": "请"},
        {"word": "thank", "pos": "verb", "zh": "感谢"},
        {"word": "yes", "pos": "adverb", "zh": "是"},
        {"word": "no", "pos": "adverb", "zh": "不"},
        {"word": "name", "pos": "noun", "zh": "名字"},
        {"word": "age", "pos": "noun", "zh": "年龄"},
        {"word": "country", "pos": "noun", "zh": "国家"},
        {"word": "city", "pos": "noun", "zh": "城市"},
        {"word": "family", "pos": "noun", "zh": "家庭"},
        {"word": "friend", "pos": "noun", "zh": "朋友"},
        {"word": "house", "pos": "noun", "zh": "房子"},
        {"word": "room", "pos": "noun", "zh": "房间"},
        {"word": "food", "pos": "noun", "zh": "食物"},
        {"word": "water", "pos": "noun", "zh": "水"},
        {"word": "time", "pos": "noun", "zh": "时间"},
        {"word": "day", "pos": "noun", "zh": "天"},
        {"word": "year", "pos": "noun", "zh": "年"},
        {"word": "work", "pos": "verb", "zh": "工作"}
    ],
    "A2": [
        {"word": "describe", "pos": "verb", "zh": "描述"},
        {"word": "explain", "pos": "verb", "zh": "解释"},
        {"word": "understand", "pos": "verb", "zh": "理解"},
        {"word": "remember", "pos": "verb", "zh": "记住"},
        {"word": "forget", "pos": "verb", "zh": "忘记"},
        {"word": "begin", "pos": "verb", "zh": "开始"},
        {"word": "finish", "pos": "verb", "zh": "完成"},
        {"word": "help", "pos": "verb", "zh": "帮助"},
        {"word": "need", "pos": "verb", "zh": "需要"},
        {"word": "want", "pos": "verb", "zh": "想要"},
        {"word": "like", "pos": "verb", "zh": "喜欢"},
        {"word": "hate", "pos": "verb", "zh": "讨厌"},
        {"word": "problem", "pos": "noun", "zh": "问题"},
        {"word": "solution", "pos": "noun", "zh": "解决方案"},
        {"word": "idea", "pos": "noun", "zh": "想法"},
        {"word": "plan", "pos": "noun", "zh": "计划"},
        {"word": "reason", "pos": "noun", "zh": "原因"},
        {"word": "result", "pos": "noun", "zh": "结果"},
        {"word": "change", "pos": "noun", "zh": "变化"},
        {"word": "difference", "pos": "noun", "zh": "不同"}
    ],
    "B1": [
        {"word": "discuss", "pos": "verb", "zh": "讨论"},
        {"word": "argue", "pos": "verb", "zh": "争论"},
        {"word": "persuade", "pos": "verb", "zh": "说服"},
        {"word": "suggest", "pos": "verb", "zh": "建议"},
        {"word": "recommend", "pos": "verb", "zh": "推荐"},
        {"word": "compare", "pos": "verb", "zh": "比较"},
        {"word": "contrast", "pos": "verb", "zh": "对比"},
        {"word": "analyze", "pos": "verb", "zh": "分析"},
        {"word": "evaluate", "pos": "verb", "zh": "评估"},
        {"word": "create", "pos": "verb", "zh": "创造"},
        {"word": "develop", "pos": "verb", "zh": "发展"},
        {"word": "improve", "pos": "verb", "zh": "改进"},
        {"word": "achieve", "pos": "verb", "zh": "实现"},
        {"word": "succeed", "pos": "verb", "zh": "成功"},
        {"word": "fail", "pos": "verb", "zh": "失败"},
        {"word": "experience", "pos": "noun", "zh": "经验"},
        {"word": "knowledge", "pos": "noun", "zh": "知识"},
        {"word": "skill", "pos": "noun", "zh": "技能"},
        {"word": "ability", "pos": "noun", "zh": "能力"},
        {"word": "opportunity", "pos": "noun", "zh": "机会"}
    ],
    "B2": [
        {"word": "interpret", "pos": "verb", "zh": "解释"},
        {"word": "criticize", "pos": "verb", "zh": "批评"},
        {"word": "justify", "pos": "verb", "zh": "证明合理"},
        {"word": "demonstrate", "pos": "verb", "zh": "演示"},
        {"word": "illustrate", "pos": "verb", "zh": "说明"},
        {"word": "summarize", "pos": "verb", "zh": "总结"},
        {"word": "conclude", "pos": "verb", "zh": "得出结论"},
        {"word": "predict", "pos": "verb", "zh": "预测"},
        {"word": "hypothesize", "pos": "verb", "zh": "假设"},
        {"word": "theorize", "pos": "verb", "zh": "理论化"},
        {"word": "concept", "pos": "noun", "zh": "概念"},
        {"word": "theory", "pos": "noun", "zh": "理论"},
        {"word": "principle", "pos": "noun", "zh": "原则"},
        {"word": "method", "pos": "noun", "zh": "方法"},
        {"word": "approach", "pos": "noun", "zh": "方法"},
        {"word": "strategy", "pos": "noun", "zh": "策略"},
        {"word": "technique", "pos": "noun", "zh": "技巧"},
        {"word": "process", "pos": "noun", "zh": "过程"},
        {"word": "system", "pos": "noun", "zh": "系统"},
        {"word": "structure", "pos": "noun", "zh": "结构"}
    ],
    "C1": [
        {"word": "synthesize", "pos": "verb", "zh": "综合"},
        {"word": "integrate", "pos": "verb", "zh": "整合"},
        {"word": "coordinate", "pos": "verb", "zh": "协调"},
        {"word": "negotiate", "pos": "verb", "zh": "谈判"},
        {"word": "mediate", "pos": "verb", "zh": "调解"},
        {"word": "arbitrate", "pos": "verb", "zh": "仲裁"},
        {"word": "innovate", "pos": "verb", "zh": "创新"},
        {"word": "transform", "pos": "verb", "zh": "转变"},
        {"word": "revolutionize", "pos": "verb", "zh": "革命化"},
        {"word": "optimize", "pos": "verb", "zh": "优化"},
        {"word": "paradigm", "pos": "noun", "zh": "范式"},
        {"word": "framework", "pos": "noun", "zh": "框架"},
        {"word": "infrastructure", "pos": "noun", "zh": "基础设施"},
        {"word": "mechanism", "pos": "noun", "zh": "机制"},
        {"word": "phenomenon", "pos": "noun", "zh": "现象"},
        {"word": "perspective", "pos": "noun", "zh": "视角"},
        {"word": "dimension", "pos": "noun", "zh": "维度"},
        {"word": "criterion", "pos": "noun", "zh": "标准"},
        {"word": "parameter", "pos": "noun", "zh": "参数"},
        {"word": "variable", "pos": "noun", "zh": "变量"}
    ]
}

def generate_example(word: str, pos: str, cefr: str) -> str:
    """生成例句"""
    examples = {
        "noun": [
            f"The {word} is very important.",
            f"I need to buy a new {word}.",
            f"This {word} has many uses.",
            f"The {word} of the story is interesting.",
            f"We discussed the {word} in class."
        ],
        "verb": [
            f"I {word} every day.",
            f"You should {word} more often.",
            f"She {word}s very well.",
            f"They will {word} tomorrow.",
            f"We need to {word} this problem."
        ],
        "adjective": [
            f"This is a {word} example.",
            f"The {word} solution works best.",
            f"She has a {word} personality.",
            f"It was a {word} experience.",
            f"The {word} approach is effective."
        ],
        "adverb": [
            f"She speaks {word}.",
            f"He works {word} hard.",
            f"They arrived {word} early.",
            f"I {word} agree with you.",
            f"It was {word} difficult."
        ]
    }
    
    if pos in examples:
        return random.choice(examples[pos])
    else:
        return f"This is an example with {word}."

def get_topics_for_word(word: str, pos: str, cefr: str) -> List[str]:
    """为单词分配主题"""
    topics = []
    
    # 根据CEFR级别分配主题
    if cefr in ["A1", "A2"]:
        topics.extend(random.sample(["school", "daily", "learning"], 2))
    elif cefr == "B1":
        topics.extend(random.sample(["school", "learning", "grammar", "society"], 2))
    elif cefr == "B2":
        topics.extend(random.sample(["science", "academic", "math", "society"], 2))
    else:  # C1
        topics.extend(random.sample(["academic", "business", "law", "science"], 2))
    
    return list(set(topics))[:2]  # 最多2个主题

def get_levels_for_cefr(cefr: str) -> List[str]:
    """根据CEFR级别分配学习阶段"""
    mapping = {
        "A1": ["Primary"],
        "A2": ["Primary", "Middle"],
        "B1": ["Middle", "High"],
        "B2": ["High", "University"],
        "C1": ["University", "Professional"]
    }
    return mapping.get(cefr, ["Primary"])

def generate_vocab_data() -> List[Dict]:
    """生成词汇数据"""
    vocab_list = []
    word_id = 1
    
    for cefr_level in CEFR_LEVELS:
        level_words = BASE_VOCAB.get(cefr_level, [])
        
        for i, word_data in enumerate(level_words[:WORDS_PER_LEVEL]):
            word = word_data["word"]
            pos = word_data["pos"]
            definition_zh = word_data["zh"]
            
            # 生成英文定义
            definition_en = f"to {word}" if pos == "verb" else f"a {word}"
            
            # 分配频率排名（基于CEFR级别）
            freq_rank = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5}[cefr_level]
            
            vocab_item = {
                "id": f"w{word_id}",
                "lemma": word,
                "headword": word,
                "pos": pos,
                "cefr": cefr_level,
                "freq_rank": freq_rank,
                "definition_en": definition_en,
                "definition_zh": definition_zh,
                "example_en": generate_example(word, pos, cefr_level),
                "topics": get_topics_for_word(word, pos, cefr_level),
                "levels": get_levels_for_cefr(cefr_level)
            }
            
            vocab_list.append(vocab_item)
            word_id += 1
    
    return vocab_list

def main():
    """主函数"""
    print("生成词汇数据...")
    vocab_data = generate_vocab_data()
    
    print(f"生成了 {len(vocab_data)} 个单词")
    
    # 保存到文件
    output_file = "/var/www/LanguageLearning/data/vocab/words.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(vocab_data, f, ensure_ascii=False, indent=2)
    
    print(f"词汇数据已保存到 {output_file}")
    
    # 更新索引文件
    index_file = "/var/www/LanguageLearning/data/vocab/index.json"
    with open(index_file, 'r', encoding='utf-8') as f:
        index_data = json.load(f)
    
    # 统计各阶段单词数量
    level_counts = {}
    for item in vocab_data:
        for level in item["levels"]:
            level_counts[level] = level_counts.get(level, 0) + 1
    
    index_data["counts"] = {
        "total": len(vocab_data),
        "byLevel": level_counts
    }
    
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    print("索引文件已更新")
    
    # 显示统计信息
    print("\n词汇统计:")
    print(f"总单词数: {len(vocab_data)}")
    print("按CEFR级别分布:")
    cefr_counts = {}
    for item in vocab_data:
        cefr_counts[item["cefr"]] = cefr_counts.get(item["cefr"], 0) + 1
    
    for cefr, count in sorted(cefr_counts.items()):
        print(f"  {cefr}: {count} 个单词")

if __name__ == "__main__":
    main()
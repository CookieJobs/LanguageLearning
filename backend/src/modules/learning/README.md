后端模块：学习流程与词库
数据来源：MongoDB 词库与掌握记录、DeepSeek（可选）
关系：提供学习主流程与故事生成接口
一旦我所属的文件夹有所变化，请更新我。

文件清单：
- deepseek.service.ts — 服务 — 句子评估与故事生成
- learning.controller.ts — 控制器 — 学习主流程接口
- learning.module.ts — 模块 — 聚合学习依赖
- mastery.schema.ts — 模型 — 单词掌握记录
- story.controller.ts — 控制器 — 故事生成接口
- vocab.schema.ts — 模型 — 词库结构
- vocab-seed.service.ts — 服务 — 启动自动导入词库
- vocab.service.ts — 服务 — 词库抽取与筛选

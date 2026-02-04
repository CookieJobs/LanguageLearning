后端模块层：NestJS 模块/控制器/服务
数据来源：MongoDB/Mongoose、外部 API、JWT
关系：对外提供 REST 接口
一旦我所属的文件夹有所变化，请更新我。

文件清单：
- app.module.ts — 模块 — 应用主模块与数据库连接
- health.controller.ts — 控制器 — 健康检查接口
- auth/ — 目录 — 鉴权与会话
- learning/ — 目录 — 学习流程与词库
- stats/ — 目录 — 统计与打卡
- user/ — 目录 — 用户资料

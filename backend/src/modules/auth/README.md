后端模块：鉴权与令牌
数据来源：MongoDB 用户/刷新令牌集合、JWT
关系：为学习/统计/用户模块提供认证能力
一旦我所属的文件夹有所变化，请更新我。

文件清单：
- auth.controller.ts — 控制器 — 登录/注册/刷新/登出接口
- auth.module.ts — 模块 — 绑定鉴权依赖
- auth.service.ts — 服务 — 账户与令牌逻辑
- refresh-token.schema.ts — 模型 — 刷新令牌数据结构

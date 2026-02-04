目录职责：后端服务（NestJS）入口与配置，负责鉴权、学习与统计 API。
数据来源：MongoDB、本地词库 JSON、环境变量。
关系：为前端提供 /api REST 接口，并由 docker-compose 提供依赖。
一旦我所属的文件夹有所变化，请更新我。

文件清单：
- .env — 文件 — 本地运行环境变量
- .env.example — 文件 — 环境变量模板
- Dockerfile — 构建 — 后端镜像构建
- package-lock.json — 文件 — 依赖锁定
- package.json — 文件 — 依赖与脚本
- prisma/ — 目录 — 旧版 Prisma 资产（已弃用）
- scripts/ — 目录 — 数据脚本（词库导入/校验）
- src/ — 目录 — 业务代码与模块
- tsconfig.json — 文件 — TypeScript 配置

# 任务列表 (Tasks)

- [x] 任务 1：后端搭建 - 核心实体与服务 (Backend Setup)
  - [x] 子任务 1.1：在 NestJS 中创建 `Pet` 和 `Wallet` 的 Mongoose Schema。
    - 字段：`userId`, `level`, `exp`, `energy` (0-100), `coins` (在 Wallet 中)。
  - [x] 子任务 1.2：实现 `PetService`，处理基础 CRUD 和逻辑（增加经验、喂养/恢复能量）。
  - [x] 子任务 1.3：实现 `WalletService`，处理基础 CRUD（增加金币、消费金币）。
  - [x] 子任务 1.4：创建控制器 (`PetController`, `WalletController`) 及接口：
    - `GET /pet` (获取当前用户的宠物)
    - `POST /pet/feed` (手动喂养接口，如果需要的话，或者仅依赖钩子)
    - `GET /wallet` (获取余额)

- [x] 任务 2：后端集成 - 游戏化钩子 (Backend Integration)
  - [x] 子任务 2.1：将 `PetService` 集成到 `MasteryService` 中。
    - 当单词被标记为“掌握”时触发 `addExp`。
  - [x] 子任务 2.2：将 `WalletService` 集成到 `QuizService` 中。
    - 当测验回答正确时触发 `addCoins`。
  - [x] 子任务 2.3：将 `PetService` 集成到 `ReviewService` 中。
    - 当复习会话完成时触发 `restoreEnergy`。
  - [x] 子任务 2.4：更新用户注册流程，初始化默认的宠物和钱包。

- [x] 任务 3：前端搭建 - 状态与组件 (Frontend Setup)
  - [x] 子任务 3.1：创建 `PetContext` 或更新现有的 Store 以管理宠物/钱包状态。
  - [x] 子任务 3.2：创建 `PetDisplay` 组件。
    - 可视化等级、经验条、能量条。
    - 显示简单的宠物头像 (SVG/Icon)。
  - [x] 子任务 3.3：创建 `CoinBalance` 组件以显示当前金币。

- [x] 任务 4：前端集成 - 用户反馈 (Frontend Integration)
  - [x] 子任务 4.1：将 `PetDisplay` 添加到仪表盘/主页。
  - [x] 子任务 4.2：将 `CoinBalance` 添加到全局顶部栏或仪表盘。
  - [x] 子任务 4.3：在测验赚取金币时显示视觉反馈（Toast/动画）。
  - [x] 子任务 4.4：在复习后恢复能量时显示视觉反馈。

- [x] 任务 5：验证与打磨 (Verification & Polish)
  - [x] 子任务 5.1：验证端到端流程：注册 -> 学习 -> 宠物升级 -> 测验 -> 赚金币。
  - [x] 子任务 5.2：确保 UI 响应迅速且具有“游戏感”（基础样式）。

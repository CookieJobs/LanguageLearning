# 游戏化（宠物系统）规格说明书 (Spec)

## 目标 (Why)
目前的学习过程缺乏即时、有趣的反馈。用户学习单词和进行测验时，只能看到单调的进度条。
为了提高用户的留存率和学习动力，我们将实现“灵语守护兽 (LinguaGuardian)”（宠物系统），让学习活动直接影响虚拟宠物的成长和状态。
这建立了情感连接（“我必须学习来让我的宠物开心”）和奖励循环（“我想要金币来买好东西”）。

## 变更内容 (What Changes)
我们将引入宠物系统，包含以下核心机制：
1.  **宠物实体 (Pet Entity)**：每个用户拥有一只宠物，具有等级 (Level)、经验值 (EXP)、饱食度/能量 (Hunger/Energy) 和心情 (Mood)。
2.  **钱包实体 (Wallet Entity)**：每个用户拥有一个钱包来存储赚取的金币 (Coins)。
3.  **行动-奖励循环 (Action-Reward Loop)**：
    *   **掌握一个单词 (Mastering a Word)** -> 获得 **经验值 (EXP)**（宠物升级）。
    *   **完成复习会话 (Completing a Review Session)** -> 恢复 **饱食度/能量 (Hunger/Energy)**（喂养宠物）。
    *   **答对测验题 (Answering Quiz Correctly)** -> 获得 **金币 (Coins)**。
4.  **UI 集成 (UI Integration)**：
    *   仪表盘 (Dashboard) 显示宠物及其状态。
    *   测验/学习会话在获得奖励时显示动画反馈。

## 影响范围 (Impact)
- **后端 (Backend)**：
    - MongoDB 中新增 `Pet` 和 `Wallet` 数据模型 (Schema)。
    - 新增 `PetService` 和 `WalletService`。
    - 更新 `MasteryService`（触发经验值获取）。
    - 更新 `ReviewService`（触发喂养/能量恢复）。
    - 更新 `QuizService`（触发金币获取）。
    - 新增用于获取宠物状态和交互的 API 端点。
- **前端 (Frontend)**：
    - 新增 `PetDisplay` 组件（头像、等级条、能量条）。
    - 新增 `CoinBalance` 组件（显示金币余额）。
    - 更新状态管理以同步宠物/钱包数据。
    - 奖励事件的视觉反馈（Toast 提示/动画）。

## 新增需求 (ADDED Requirements)

### 需求：宠物管理 (Pet Management)
系统必须为每个新用户创建一个默认宠物。
系统必须允许获取当前用户的宠物状态。
系统必须支持基于经验值阈值（例如：等级 * 100 EXP）的宠物升级。

#### 场景：宠物升级 (Pet Level Up)
- **当 (WHEN)** 用户掌握了足够多的单词，超过经验值阈值时
- **那么 (THEN)** 宠物等级增加 1
- **并且 (AND)** 向用户返回/通知“升级”事件。

### 需求：经济系统 (Economy - Coins)
系统必须维护每个用户的金币余额。
系统必须允许增加金币（收入）和扣除金币（支出）。

#### 场景：赚取金币 (Earning Coins)
- **当 (WHEN)** 用户正确回答一个测验问题时
- **那么 (THEN)** 用户的金币余额增加固定数量（例如：10 金币）。

### 需求：照料系统 (Care System - Hunger/Energy)
宠物必须拥有饱食度/能量属性 (0-100)。
宠物的能量会随着时间减少（模拟或每日重置，MVP 阶段可以通过特定触发器或定时任务减少，但为简化起见：“复习增加能量”）。
**MVP 优化**：
与其做复杂的衰减机制，不如做正向激励：
- 宠物拥有“能量” (0-100)。
- 复习可以增加能量。
- 如果能量高，宠物“开心”。如果能量低，宠物“难过”。
- 能量缓慢衰减（或者简单地要求每日复习以维持“开心”状态）。

#### 场景：通过复习喂养 (Feeding via Review)
- **当 (WHEN)** 用户完成一个复习会话时
- **那么 (THEN)** 宠物的能量增加（例如：+20）。

## 修改需求 (MODIFIED Requirements)

### 需求：学习流程 (Learning Flow)
`MasteryService` 必须在单词掌握时触发 `PetService.addExp` 事件。
`QuizService` 必须在答对问题时触发 `WalletService.addCoins` 事件。

## UI/UX
- **仪表盘 (Dashboard)**：显示宠物（SVG/图标）、名字、等级徽章和能量条。
- **测验 (Quiz)**：在答案反馈附近显示“+10 金币”动画。
- **复习 (Review)**：在会话总结中显示“宠物已喂饱！”消息。

## 目标
- Onboarding 仅在“新用户流程”和“切换学段”时可见；去掉“连续打卡天数”和“已掌握单词”展示，作为过渡页面。
- 学习结束或用户返回时进入首页仪表盘，不再出现 Onboarding。

## 前端改动
- 组件调整：
  - 扩展 `Onboarding` 支持最小模式（新增 `minimal`/`hideStats` 属性），隐藏徽章与相关文案。
  - 更新 `OnboardingPage` 使用最小模式；不传复习入口。
- 路由与页面：
  - 首页 `HomePage` 去掉“更换学段弹窗”，改为点击“更换学段”跳转 `/onboarding`。
  - `LevelGuard` 保持逻辑：无学段自动跳转到 `/onboarding`；有学段则进入首页。
- 流程与上下文：
  - 修改 `AppContext.resetToHome/exitLearning` 不再清空 `level`，只重置学习队列与进度，确保返回首页不触发 `LevelGuard` 跳转到 Onboarding。
  - 保持“选择/更换学段”时写入后端 `educationLevel` 与记录 `levelSince`，选择完成后 `navigate('/')`。

## 验证
- 新用户登录 → 自动进入 `onboarding` → 选择学段 → 进入首页仪表盘；页面不显示打卡与掌握徽章。
- 首页点击“更换学段” → 跳转到 `onboarding` → 选择后回首页；`streak` 不变，掌握数量按新学段起始时间计数。
- 学习结束或点击头部返回首页 → 始终是仪表盘，不出现 Onboarding。
# 英语墙 (English Wall) Spec

## Why
为了提供更直观、更有成就感的单词学习体验，在 /review 页面引入“英语墙”功能。通过3D砖墙的可视化形式，展示用户已掌握和未掌握的单词学习进度，增强学习的趣味性和正向反馈。

## What Changes
- 在 `/review` 页面新增“英语墙”导航入口及进度显示。
- 实现 3D 砖墙视觉效果核心组件，区分未掌握（灰色）和已掌握（发光金色）状态的单词砖块。
- 实现平滑的点亮动画和粒子特效。
- 添加鼠标悬停砖块时的自动定位浮动卡片（展示翻译、词性、音标、例句）。
- 实现单词详情模态弹窗，展示发音、释义、词根词缀、学习数据曲线，并提供快捷复习操作。
- 引入单词状态实时同步机制和虚拟列表/懒加载渲染（支持十万级单词量）。
- 增加学习里程碑成就通知。

## Impact
- Affected specs: 单词复习模块、进度展示模块、用户激励系统。
- Affected code: 
  - `frontend/pages/ReviewPage.tsx`
  - `frontend/components/EnglishWall/*` (新建)
  - `frontend/store/vocabularyStore.ts` (状态管理)

## ADDED Requirements
### Requirement: 英语墙入口与进度展示
The system SHALL 在 `/review` 页面提供带有砖墙图标的入口，并实时显示掌握进度百分比。

#### Scenario: 用户查看复习页面
- **WHEN** 用户进入 `/review` 页面
- **THEN** 看到“英语墙”入口，并显示当前已掌握单词数与总单词数的比例。

### Requirement: 3D 砖墙交互与渲染
The system SHALL 以 3D 砖墙形式按学习顺序由下至上渲染单词，并支持高性能滚动和交互。

#### Scenario: 浏览英语墙
- **WHEN** 用户打开英语墙面板
- **THEN** 看到灰色的未掌握单词砖块和发光金色的已掌握单词砖块，且大数量词汇下保持滚动流畅（响应时间<100ms）。

### Requirement: 单词详情悬停与弹窗
The system SHALL 在悬停砖块时展示简明信息卡片，并在点击时打开包含详尽数据和图表的详情弹窗。

#### Scenario: 查看单词详情
- **WHEN** 用户点击某块金色的单词砖块
- **THEN** 弹出模态框，展示该单词的详细信息、学习数据图表，并提供“标记为未掌握”或“加入生词本”等快捷操作。

## MODIFIED Requirements
无直接修改的旧需求，主要为新增独立看板。

## REMOVED Requirements
无
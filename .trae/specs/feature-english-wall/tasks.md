# Tasks

- [x] Task 1: 基础环境与入口准备
  - [x] SubTask 1.1: 在 `/review` 页面（`ReviewPage.tsx`）添加“英语墙”导航入口，包含砖墙图标和进度百分比计算逻辑。
  - [x] SubTask 1.2: 搭建 `EnglishWall` 核心组件的目录结构和基础路由/弹窗状态控制。

- [x] Task 2: 3D 砖墙核心视觉与动画开发
  - [x] SubTask 2.1: 引入 3D 渲染技术（如 Three.js 或 CSS 3D），实现砖块按学习顺序自底向上堆砌的布局。
  - [x] SubTask 2.2: 实现砖块的基础材质和文本贴图（正面显示单词原文，字体清晰）。
  - [x] SubTask 2.3: 实现砖块状态区分（未掌握灰色，已掌握发光金色），以及状态切换时的点亮渐变和粒子特效。

- [x] Task 3: 悬停交互与浮动卡片
  - [x] SubTask 3.1: 开发悬停浮动卡片组件（包含中文翻译、词性、音标、例句）。
  - [x] SubTask 3.2: 实现浮动卡片的边缘检测与自动定位，确保不超出视窗范围。

- [x] Task 4: 单词详情模态弹窗
  - [x] SubTask 4.1: 设计并开发详情模态框 UI，包含发音音频播放、所有释义、词根词缀展示。
  - [x] SubTask 4.2: 集成学习曲线图表组件（如使用 ECharts 或 Recharts），展示学习数据（首次学习时间、复习次数等）。
  - [x] SubTask 4.3: 实现弹窗内的快捷操作（标记为未掌握、加入生词本）并对接状态管理。

- [x] Task 5: 数据管理与性能优化
  - [x] SubTask 5.1: 建立单词状态的实时同步机制。
  - [x] SubTask 5.2: 实现懒加载/虚拟化渲染逻辑，确保十万级单词量下可视区域的高效渲染，首屏加载 < 2s。
  - [x] SubTask 5.3: 添加学习里程碑事件监听与成就通知（如“已掌握100词”）。

- [x] Task 6: 兼容性与测试保障
  - [x] SubTask 6.1: 适配移动端触摸交互（滑动浏览、点击弹窗）。
  - [x] SubTask 6.2: 编写并执行多浏览器（Chrome/Firefox/Safari/Edge）兼容性测试。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 2
- Task 5 depends on Task 2
- Task 6 depends on Task 2, 3, 4, 5
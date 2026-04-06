## 现状评估
- 目前为单路由 SPA，通过本地状态 `screen` 控制视图切换：`LanguageLearning/App.tsx:14`、`LanguageLearning/App.tsx:246-301`。
- 登录态缺失路由表达：`!token` 时直接渲染 `<Auth>`（`LanguageLearning/App.tsx:245-247`）。
- 结果：无法深链接、浏览器前进/后退不可预期、刷新丢上下文、SEO/监控路由维度不清晰。

## 路由设计
- `/login` 登录页（公开路由）。
- `/` 首页（Onboarding：选择学段）。
- `/learn/:level` 学习页（受保护路由；首次进入触发取词并展示）。
- `/review` 掌握单词页（受保护路由）。
- 可选参数：`/learn/:level?idx=3` 表示定位到队列第 3 个词。

## 技术方案
- 引入 `react-router-dom@6`，使用 `BrowserRouter` + `Routes` + `Route` + `useNavigate`。
- 保留现有的 SPA 回退（Nginx 的 `try_files ... /index.html` 与 Vercel 重写已就绪）。
- 新增简单的权限守卫：`AuthGuard`（读取 `localStorage` 中的 `linguaCraft_token`，未登录跳转 `/login`）。
- 将 `App.tsx` 中与学习会话相关的状态移动到 `AppProvider`（`React Context`）：`level`、`wordQueue`、`currentWordIndex`、`masteredItems`、`sessionProgress`、`streak`、`token`、以及方法 `handleLevelSelect`、`handleWordSuccess` 等。
- 页面组件化：
  - `pages/LoginPage.tsx`：封装原 `components/Auth.tsx`。
  - `pages/HomePage.tsx`：封装原 `components/Onboarding.tsx`，选择学段后 `navigate('/learn/A2')` 等。
  - `pages/LearnPage.tsx`：封装原 `LearningSession` 区域逻辑，从 URL 取 `:level`，在 `useEffect` 中执行一次 `fetchWordsForLevel(level, existingWords)`。
  - `pages/ReviewPage.tsx`：封装原 `ReviewList`。
- 动画：现有的 `TransitionSwitch` 可替换为路由级过渡（可保留作页面内部淡入淡出，或改为 `react-transition-group` 的 `CSSTransition` 包裹 `Outlet`）。
- 头部交互：点击品牌返回 `navigate('/')`；登出走 `apiLogout` 后 `navigate('/login')`。

## 代码改动点
1. 安装依赖：`react-router-dom`。
2. `App.tsx`：去除 `screen` 映射视图，改为提供 `AppProvider` 和全局布局（Header/Footer/LoadingOverlay），在中间渲染 `<Router>` + `<Routes>`。
3. 新增 `src/pages/*` 四个页面文件，按现有组件封装迁移逻辑。
4. 新增 `src/router/AuthGuard.tsx`（或内联到路由）：保护 `/learn/:level` 与 `/review`。
5. 在 `Onboarding` 的“打开已掌握”改为路由跳转 `/review`，在选择学段后跳转 `/learn/:level`。
6. 将原 `handleReturnHome`、`handleExitLearning` 的重置逻辑迁移为：根据路由跳转并在 `AppProvider` 中重置必要状态。
7. 保留并复用现有本地存储持久化逻辑（`linguaCraft_mastered`、`linguaCraft_streak`、`linguaCraft_token`）。

## 验证与回归
- 刷新 `/learn/A2` 能正确加载并进入学习；返回键可在页面间正确导航。
- 未登录访问受保护路由会被重定向到 `/login`；登录后返回原目标页。
- 从首页进入 `/learn/:level` 会触发取词、进度条/退出按钮正常。
- `/review` 展示掌握列表，返回上一页恢复上下文。
- Nginx/Vercel 的路由回退不需变更，深链访问工作正常。

## 可选方案（小改动）
- 不引入路由库，仅用 `history.pushState` 同步 `screen` 与 URL：`/`、`/login`、`/learn`、`/review`。代价小但扩展性差，不建议长期采用。

请确认采用“正式路由方案”，我将按以上步骤实施并提交改动。
## 目标
- 将“已掌握单词”入口从学段卡片区移动到首页标题下方，与“连续打卡 n 天”徽章并列显示。
- 样式与“连续打卡 n 天”保持一致（同一风格的圆角徽章、同色系、同尺寸）。
- 点击“已掌握单词”徽章后进入已掌握列表页面（当前逻辑保持不变）。

## 组件调整
- 新增组件 `MasteredBadge`（可点击的徽章）：
  - 复用 `StreakBadge` 的样式类：`inline-flex items-center space-x-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200`。
  - 文案为“已掌握单词”。
  - 支持 `onClick` 回调；支持 `disabled`（加载中时置灰不可点击）。
- 现有 `StreakBadge` 保持不变，用于展示“连续打卡 n 天”。

## 首页布局修改（Onboarding）
- 在 `components/Onboarding.tsx` 的标题下方（`text-center` 容器内）将徽章区调整为水平并列：
  - `StreakBadge` + `MasteredBadge` 放入 `div`，使用 `flex justify-center gap-3`。
  - `MasteredBadge` 的 `onClick` 调用 `onOpenMastered`。
- 删除当前网格中的“已掌握单词”卡片按钮，避免入口重复。
- `OnboardingProps` 已包含 `onOpenMastered` 与 `streakCount`；新增引入 `MasteredBadge`，并传递 `isLoading` 作为 `disabled`。

## 逻辑与数据
- 进入“已掌握单词”页面的逻辑保持现状：
  - 在 `App.tsx:186-188` 已传递 `onOpenMastered={() => { setPrevScreen('onboarding'); setScreen('review'); }}`。
  - “返回”仍按上一页返回（`App.tsx:230-232`）。
- 打卡天数 `streak` 来源保持：`App.tsx` 在 `handleWordSuccess` 中更新本地存储并同步到 `streak`，`streakCount` 传入首页。

## 代码改动点
- 新增文件：`components/MasteredBadge.tsx`（或直接在 `StreakBadge` 基础上抽象为通用徽章组件）。
- 修改 `components/Onboarding.tsx`：
  - 引入并渲染两个徽章于标题下方。
  - 删除网格中的“已掌握单词”卡片（原 `lines 56-71`）。
- `App.tsx`：
  - 无需改动现有 `onOpenMastered` 传参；保留 `streakCount` 传入。

## 验证
- 启动前端后在首页确认：
  - 标题下方出现两个并列徽章：“连续打卡 n 天”和“已掌握单词”。
  - 加载中时“已掌握单词”徽章不可点击（样式置灰）。
  - 点击“已掌握单词”后进入列表页；点击列表页“返回”回到首页。
  - 学段卡片区不再出现“已掌握单词”卡片。

## 兼容性与无障碍
- 徽章均提供 `title` 属性用于提示。
- `MasteredBadge` 使用 `role="button"` 与键盘可用性（`tabIndex=0`）；回车触发点击。
- 样式跟随 `StreakBadge`，在移动端仍保持良好显示。
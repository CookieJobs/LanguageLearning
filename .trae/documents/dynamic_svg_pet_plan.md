# 动态 SVG 宠物组件实现计划

## 1. 摘要 (Summary)
当前前端应用中，宠物形象（Pet Avatar）是通过简单的 Emoji（如 `🐉` 或 `🐶`）进行渲染的，这种方式缺乏互动感和“养成”体验。本计划旨在将现有的 Emoji 宠物替换为一套**纯前端驱动、基于 SVG 和 CSS 动画的动态宠物系统**。新的宠物将支持呼吸、眨眼等待机动画，并能根据用户的交互（喂食、玩耍）以及宠物的状态（等级、饥饿度）发生视觉上的变化。

## 2. 当前状态分析 (Current State Analysis)
- **宠物组件位置**：位于 `frontend/components/PetDisplay.tsx`。
- **渲染方式**：在 `div.relative.z-10.mb-6.group` 内部，通过判断 `pet.appearance.type` 返回固定的 Emoji 字符。
- **交互状态**：`PetDisplay.tsx` 中已经维护了 `isFeeding` 和 `isPlaying` 状态，并配合简单的 Tailwind 动画（如 `scale-110 rotate-3` 和 `animate-bounce`）来提供交互反馈。
- **全局动画**：现有的自定义动画定义在 `frontend/tailwind.config.js` 中（如 `fadeInUp`）。

## 3. 提议的变更 (Proposed Changes)

### 3.1 创建新组件：`AnimatedPet.tsx`
**文件**：`frontend/components/AnimatedPet.tsx`
**目的**：封装 SVG 绘制逻辑和专属的 CSS 关键帧动画。
**实现细节**：
- **Props 设计**：
  ```tsx
  interface AnimatedPetProps {
    type?: string;      // 基础类型（例如：dragon, dog, blob 等）
    color?: string;     // 基础颜色
    level?: number;     // 决定进化的外观特征（如长出角、翅膀）
    hunger?: number;    // 决定面部表情（<30 时为难过/饥饿表情）
    isFeeding?: boolean;// 触发跳跃或进食动画
    isPlaying?: boolean;// 触发开心互动动画
    size?: number;      // 容器尺寸，默认 128px
  }
  ```
- **SVG 结构**：
  - **阴影 (Shadow)**：底部的椭圆，随身体呼吸动画缩放。
  - **身体组 (Body Group)**：核心路径，应用持续的缓慢 `transform: scale`（呼吸效果）。
  - **特征组件 (Features)**：基于 `level` 条件渲染，例如耳朵、小翅膀。
  - **面部组 (Face Group)**：包含眼睛和嘴巴，应用间歇性的 `transform: scaleY`（眨眼效果）。表情根据 `hunger` 改变。
- **CSS 注入**：使用组件内部的 `<style>` 标签注入专属的 `@keyframes`（如 `pet-breath`, `pet-blink`），以保持组件的独立性和便携性，避免污染全局 Tailwind 配置。

### 3.2 更新现有组件：`PetDisplay.tsx`
**文件**：`frontend/components/PetDisplay.tsx`
**目的**：集成新创建的 `AnimatedPet` 组件，替换旧的 Emoji。
**实现细节**：
- 导入 `AnimatedPet` 组件。
- 移除原有的 Emoji 渲染逻辑（`{pet.appearance.type === 'dragon' ? '🐉' : '🐶'}`）。
- 将 `AnimatedPet` 放置在头像容器内，并传入所需的 Props：
  ```tsx
  <AnimatedPet 
    type={pet.appearance.type} 
    color={pet.appearance.color || '#6366f1'} 
    level={pet.level}
    hunger={pet.hunger}
    isFeeding={isFeeding}
    isPlaying={isPlaying}
  />
  ```
- 移除外层容器上不必要的 `transition-transform`（如 `group-hover:scale-105` 等），因为 `AnimatedPet` 内部将接管这些动态效果，防止动画冲突。

### 3.3 （可选）更新后端 Schema 默认值
**文件**：`backend/src/modules/pet/pet.schema.ts`
**目的**：确保新用户的宠物拥有合适的默认颜色。
**实现细节**：
- 检查 `@Prop({ type: Object, default: { type: 'dragon', color: 'green' } })`。当前默认颜色是 `green`，可以直接映射为有效的 CSS 颜色值（如 `#10b981`），或在前端进行色值映射。

## 4. 假设与决策 (Assumptions & Decisions)
- **决策 1 (技术选型)**：坚持使用纯 SVG + CSS，不引入 Lottie 或 Three.js。原因：保持前端包体积小，性能高，且更容易通过 React Props 实现程序化生成（Procedural Generation）。
- **决策 2 (样式隔离)**：宠物的核心动画（呼吸、眨眼）将通过内联 `<style>` 定义在 `AnimatedPet` 组件内部，而不是添加到 `tailwind.config.js` 中。原因：这些动画是高度定制的，专属于该 SVG 结构，集中管理更易于维护。
- **决策 3 (设计风格)**：采用圆润的“水滴/史莱姆”扁平风格作为基础形态。这种风格容易用简单的 SVG 路径实现，且外观可爱。

## 5. 验证步骤 (Verification)
1.  **运行应用**：启动前端应用，登录并进入首页。
2.  **视觉检查**：确认宠物区域不再显示 Emoji，而是显示一个圆润的 SVG 角色。
3.  **待机动画检查**：观察宠物是否会进行平滑的呼吸（身体上下起伏、阴影缩放）和偶尔的眨眼。
4.  **状态反馈检查**：
    - 点击“Feed”，观察宠物是否有跳跃/开心反馈。
    - 点击“Play”，观察宠物是否有互动反馈。
5.  **等级/饥饿度反馈（模拟）**：如果在数据库或代码中临时修改宠物的 `level`（如设为 10）或 `hunger`（如设为 10），确认外观（长出新特征）和表情（变难过）是否会相应改变。

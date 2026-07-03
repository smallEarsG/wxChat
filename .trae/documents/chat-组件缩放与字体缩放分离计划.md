# chat.vue 组件缩放与字体缩放分离计划

## Summary
- 在 `pages/chat/chat.vue` 的菜单弹框（`L735-L753`）新增一个“组件缩放”滑块。
- 保留现有“字体调节”滑块用于文字/`rpx()` 体系缩放，并将“组件类缩放”改由新滑块单独控制。
- 目标是让“字体大小调整”与“卡片/图片等组件尺寸调整”互不影响。

## Current State Analysis
- 当前菜单弹框只有一个滑块（标签“字体调节”），绑定 `scale` 和 `onScaleChange`。
- `scale` 来自 `scaleMixin`（`store.state.scale`），会影响：
  - 页面中大量 `:style="{ fontSize: rpx(...) }"`（字体与部分尺寸）
  - 多个子组件 `:fontScale="Number(scale) || 1"`（如 `ExternalPayCard` / `TransferCard` / `RedBag` / `chatFlie` / `WxCard` / `ChTf`）
  - 图片容器样式函数 `getImageContainerStyle/getImageStyle` 内的 `this.scale`
- 结论：当前单滑块是“字体+组件”耦合控制，无法分开调节。

## Proposed Changes

### 1) 菜单 UI：新增“组件缩放”滑块
- 文件：`e:\test2\wxChat2\wxChat\pages\chat\chat.vue`
- 区域：`uni-popup ref="menuPopup"`（`L735-L753` 附近）
- 改动：
  - 保留现有“字体调节”滑块（绑定 `scale` / `onScaleChange`）
  - 新增第二个滑块，文案“组件缩放”，绑定 `componentScale` / `onComponentScaleChange`
  - 范围与步进先与字体滑块保持一致（`0.7 ~ 1.5`, `step=0.02`），减少学习成本

### 2) 新增组件缩放状态与持久化
- 文件：`e:\test2\wxChat2\wxChat\pages\chat\chat.vue`
- 改动：
  - 在 `data()` 增加 `componentScale`（默认从本地存储读取，缺省 `1.0`）
  - 新增 `onComponentScaleChange(e)`，更新 `componentScale` 并写入本地存储（建议键名：`chat_component_scale`）
  - 在页面初始化流程读取该值并兜底校验（非数字时回退 `1.0`）
- 原因：组件缩放应可独立于全局字体缩放且重进页面可保持。

### 3) 将组件类尺寸引用从 `scale` 切到 `componentScale`
- 文件：`e:\test2\wxChat2\wxChat\pages\chat\chat.vue`
- 改动：
  - 所有 `:fontScale="Number(scale) || 1"` 改为 `:fontScale="Number(componentScale) || 1"`
  - `getImageContainerStyle` / `getImageStyle` 中使用 `componentScale` 替代 `this.scale`
- 保持不变：
  - `rpx()` 相关字体与布局缩放仍由 `scale`（字体调节）控制
  - `onScaleChange` 仍调用 `setScale`（原逻辑不动）

### 4) 影响范围控制
- 本次只改 `chat.vue`，不改 `scaleMixin`、`store/index.js`、其他页面，以避免全局行为回归风险。
- 如果后续要跨页面统一“组件缩放”，再抽离到 store（本次不做）。

## Assumptions & Decisions
- “字体调节缩放”定义为：由 `scale` 驱动的文字与 `rpx()` 样式缩放。
- “组件缩放”定义为：子组件 `fontScale` 和聊天图片容器相关尺寸缩放。
- 两个滑块都保留实时预览（`@changing` + `@change`）行为。
- 不新增后端配置，仅使用本地存储持久化组件缩放。

## Verification Steps
- 功能验证：
  1. 打开菜单，确认出现两个滑块（字体调节、组件缩放）。
  2. 拖动“字体调节”：聊天文字大小变化明显；组件卡片尺寸变化应相对受控。
  3. 拖动“组件缩放”：转账/红包/文件/订单等卡片与图片容器尺寸变化；普通文本字号不应联动变化。
  4. 刷新/重进页面：组件缩放保持上次值。
- 回归验证：
  - 长按菜单、消息编辑/插入、拖拽排序、背景与水印设置不受影响。
- 质量验证：
  - 对 `chat.vue` 运行 diagnostics，确保无新增错误。

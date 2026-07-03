# chatGrop openMenu 与菜单弹框功能实施计划

## 目标
- 在 `pages/chatGrop/chatGrop.vue` 中，基于 `pages/chat/chat.vue` 的实现风格，补齐顶部右侧更多按钮的 `openMenu` 行为。
- 增加与菜单弹框对应的功能闭环（打开弹框、操作项、状态更新、设置持久化）。
- 保持现有群聊页（角色、消息编辑、长按菜单）行为不被破坏。

## 现状梳理（只读分析结果）
- `chatGrop.vue` 顶部安卓端“更多”图标已绑定 `@click="openMenu"`，但 `openMenu()` 为空实现。
- iOS 端更多图标未绑定点击事件。
- 页面内当前不存在 `menuPopup`（右上角菜单弹层）与 `watermarkPopup`（水印设置弹层）模板。
- `chatGrop.vue` 使用了 `scaleMixin`，但没有 `onScaleChange` 菜单逻辑。
- 页面已有 `UploadImage ref="photoPopup"`，但没有用于“修改背景”的 `bgPopup` 引用。
- `chat.vue` 中该能力由以下部分组成：`menuPopup`（修改背景+字体调节+快捷栏显示+水印设置）与 `watermarkPopup`，并包含对应 methods 与本地存储逻辑。

## 实施步骤

### 1) 补齐菜单入口与弹层结构
- 为 `chatGrop.vue` 的 iOS 更多图标增加 `@click="openMenu"`，与安卓保持一致。
- 在模板中新增 `uni-popup ref="menuPopup"`，先落地与群聊页兼容的基础项：
  - 修改背景
  - 字体调节（slider）
  - 水印设置入口
- 在模板中新增 `uni-popup ref="watermarkPopup" type="center"`，结构对齐 `chat.vue` 的水印设置面板。

### 2) 补齐 data 状态与计算样式
- 在 `data()` 新增菜单/水印相关状态：
  - `contentbg`
  - `watermarkVisible` / `watermarkText` / `watermarkSpacing` / `watermarkFontSize`
  - `watermarkForm`
- 在 `computed` 新增：
  - `watermarkPattern`
  - `chatBodyStyle`
- 将聊天滚动区域改为 `:style="chatBodyStyle"`，使背景与水印设置可即时生效。

### 3) 实现 openMenu 与菜单功能方法
- 完成 `openMenu()`：打开 `menuPopup`（顶部弹出）。
- 新增并接入：
  - `openBgPopup()`：打开背景上传弹窗并关闭菜单
  - `onBgSubmit(data)`：保存背景图
  - `onScaleChange(e)`：提交字体缩放到 store（沿用当前项目做法）
  - `openWatermarkSettings()` / `closeWatermarkSettings()`
  - `onWatermarkVisibleChange()` / `onWatermarkSpacingChange()` / `onWatermarkFontSizeChange()`
  - `applyWatermarkSettings()`
  - `loadWatermarkSettings()` / `saveWatermarkSettings()`
- 在 `onLoad` 调用 `loadWatermarkSettings()`，保证刷新后生效。

### 4) 补齐弹层依赖与引用
- 新增背景上传弹层：`<UploadImage ref="bgPopup" @submit="onBgSubmit" />`。
- 确认并补齐模板中的 `menuPopup` / `watermarkPopup` `ref` 与 methods 对应关系。

### 5) 样式对齐
- 迁移 `chat.vue` 中菜单与水印弹层所需样式到 `chatGrop.vue`：
  - `.menu`、`.fontChange`、`.toolbar-toggle`
  - `.watermark-settings-entry`、`.watermark-popup`、`.wm-*`
- 保持现有 `chatGrop` 样式命名与结构，不影响原有消息区布局。

### 6) 验证与回归
- 静态检查：
  - `openMenu` 在安卓/iOS 都可打开菜单。
  - 菜单项点击均有响应且无空方法。
- 功能检查：
  - 修改背景可实时生效。
  - 字体缩放可实时影响页面字号。
  - 水印设置可打开/关闭、修改参数、保存并在重进页面后恢复。
- 代码检查：
  - 执行诊断，确保 `chatGrop.vue` 无新增报错。

## 实现边界与兼容说明
- 本次不引入 `ChatToolBar` 开关（`chatGrop` 当前模板不含该组件），避免额外 UI 结构改动；菜单项将只保留页面已有能力可闭环的功能。
- 保持 `chatGrop` 现有角色系统、消息编辑/插入、悬浮长按菜单逻辑不改语义。
- 若后续需要与 `chat.vue` 完全一致（含快捷栏显示开关），再单独补 `ChatToolBar` 组件接入。

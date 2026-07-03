# chatGrop 链接/数字/文字着色功能计划

## Summary
- 目标：在 `pages/chatGrop/chatGrop.vue` 中，参考 `pages/chat/chat.vue`，实现聊天消息中“普通文字、链接、邮箱、长数字”分段渲染与差异化颜色显示。
- 范围：仅改 `chatGrop.vue` 的消息解析逻辑、聊天文本模板渲染分支和对应样式，不改业务数据结构与发送流程。
- 结果标准：消息中 URL、邮箱、7位及以上数字按不同颜色显示，普通文本保持默认色，emoji 渲染不受影响。

## Current State Analysis
- `chatGrop.vue` 当前 `parseMessage` 仅处理 emoji（`[emoji_n]` / `[n]`）和普通文本，不会识别链接、邮箱、数字类型。
- `chatGrop.vue` 的聊天文本模板只渲染了两类节点：
  - `part.type === 'text'`
  - `part.type === 'emoji'`
- `chat.vue` 已实现完整分段能力：
  - `parseMessage` 使用组合正则识别 `emoji/url/email/number`
  - 通过辅助函数补充解析剩余文本中的邮箱与长数字
  - 模板按 `msg-text/msg-url/msg-email/msg-number` 分类渲染
  - 样式中定义了上述 4 类文本颜色与换行规则

## Proposed Changes

### 1) 更新消息模板渲染分支
- 文件：`e:\test2\wxChat2\wxChat\pages\chatGrop\chatGrop.vue`
- 位置：`item.contentType == 'chat'` 的左右两侧消息模板（当前 `v-for="(part, partIndex) in parseMessage(item.content)"`）
- 改动：
  - 在现有 `text/emoji` 基础上，新增 `url/email/number` 三类 `<text>` 分支；
  - 分别绑定样式类 `msg-url`、`msg-email`、`msg-number`；
  - 普通文本分支使用 `msg-text`，保持和 `chat.vue` 一致。
- 原因：先让模板具备按分段类型显示差异颜色的能力。

### 2) 扩展 parseMessage 解析能力
- 文件：`e:\test2\wxChat2\wxChat\pages\chatGrop\chatGrop.vue`
- 位置：`methods.parseMessage`
- 改动：
  - 由“仅 emoji + text”升级为“emoji + url + email + number + text”组合解析；
  - 保留当前对 `[emoji_n]` 与 `[n]` 的兼容；
  - 引入与 `chat.vue` 同思路的组合正则，优先识别 emoji/链接/邮箱/数字；
  - 对剩余文本做二次处理，避免邮箱中的数字被误拆分（新增辅助解析方法）。
- 原因：模板着色依赖准确的分段类型，解析必须先完整。

### 3) 新增辅助解析方法
- 文件：`e:\test2\wxChat2\wxChat\pages\chatGrop\chatGrop.vue`
- 位置：`methods` 中新增 `parseTextForEmailAndNumber(text, result)`
- 改动：
  - 按位置提取邮箱和 7 位及以上数字；
  - 处理重叠场景（邮箱优先，避免邮箱内部数字再次标记）；
  - 将剩余片段回填为普通 text。
- 原因：保证复杂混合字符串下分段稳定性，和 `chat.vue` 对齐。

### 4) 增加文本类型样式
- 文件：`e:\test2\wxChat2\wxChat\pages\chatGrop\chatGrop.vue`
- 位置：`<style scoped>`
- 改动：
  - 新增 `.msg-text/.msg-url/.msg-email/.msg-number`；
  - 颜色参考 `chat.vue`：
    - `msg-text`: 深色
    - `msg-url`: 蓝色
    - `msg-email`: 蓝色
    - `msg-number`: 蓝色
  - 同步补充 `word-break / overflow-wrap / white-space` 以防长串撑爆布局。
- 原因：完成“可视化区分”最后一环，并保持换行体验。

## Assumptions & Decisions
- 不改发送侧表情写入格式；继续兼容历史 `[emoji_n]` 与 `[n]`。
- “数字高亮”规则沿用 `chat.vue`：仅 7 位及以上数字高亮，短数字按普通文本显示。
- 本次只做颜色区分，不新增点击跳转（例如 URL 打开浏览器）。
- 仅影响 `contentType == 'chat'` 的文本消息，其他消息类型（图片、转账等）不变。

## Verification Steps
- 静态检查：
  - `chatGrop.vue` 模板中 `parseMessage` 渲染分支包含 `text/url/email/number/emoji`。
  - `methods` 中存在新版 `parseMessage` 和 `parseTextForEmailAndNumber`。
  - 样式中存在 `msg-text/msg-url/msg-email/msg-number`。
- 功能检查（手工）：
  - 发送或插入如下文本并观察颜色：
    - 普通文本：`今天下午见`
    - 链接：`https://example.com/a/b`
    - 邮箱：`abc_123@test.com`
    - 长数字：`1234567`（应高亮）
    - 短数字：`12345`（应普通）
    - 混合：`联系 abc@test.com 或访问 www.test.com 编号 12345678 [emoji_1]`
  - 确认 emoji 仍显示图片、非原始占位字符串。
- 质量检查：
  - 对 `chatGrop.vue` 运行诊断，确保无新增语法/类型错误。

# `chat.vue` 时间改为“上午/下午”制实施计划

## 一、Summary
- 目标：将 `pages/chat/chat.vue` 中“插入时间”功能由 24 小时制改为 12 小时制，并带中文时段前缀（`上午`/`下午`）。
- 成功标准：
  - 用户在时间模块中看到的时间文案为 `上午/下午 h:mm`（如 `上午 9:05`、`下午 3:20`）。
  - 插入到聊天流中的时间提示文案不再出现 24 小时格式（如 `15:20`）。
  - 保持原有日期拼接规则（今天仅显示时间；同年显示 `M月D日 + 时间`；跨年显示 `YYYY年M月D日 + 时间`），且三种场景都必须包含 `上午/下午`。

## 二、Current State Analysis
- 当前时间选择入口在 `openTimePicker()`，默认把 `timePickerTime` 赋值为 `HH:mm`（24 小时制）。
- 当前最终时间文案由 `formatSelectedTimeText(dateStr, timeStr)` 生成，核心格式为：
  - 今天：`H:mm`（无上午/下午）
  - 非今天：`M月D日 H:mm` 或 `YYYY年M月D日 H:mm`
- 当前时间选择弹窗里“时间”一行直接展示 `timePickerTime`，也即 `HH:mm` 原值。
- 时间提交由 `confirmTimeSelection()` 调用 `onTimeSubmit({ time: formatted })` 插入 `type: "tips"` 消息。

## 三、Proposed Changes

### 1) 文件：`pages/chat/chat.vue`
- 变更点 A：新增一个统一的“12 小时 + 上午/下午”格式化方法（例如 `formatMeridiemTime(hour, minute)`）。
- 变更点 B：在 `formatSelectedTimeText()` 中改用该方法，替换原 `hourText` 的 24 小时文本。
- 变更点 C：时间弹窗的展示文本由 `{{ timePickerTime }}` 改为格式化展示（例如 `{{ formatPickerTimeDisplay(timePickerTime) }}`），保证选择阶段也符合“上午/下午”认知。
- 变更点 D：保持 `picker mode="time"` 绑定值仍为 `HH:mm`（组件数据协议不改），只改显示与最终输出，避免兼容性风险。

### 2) 详细实现策略（决策已锁定）
- 三个日期分支统一规则：
  - 今天：`上午/下午 h:mm`
  - 非今天（同年）：`M月D日 上午/下午 h:mm`
  - 非今天（跨年）：`YYYY年M月D日 上午/下午 h:mm`
- 上午/下午规则：
  - `0:00-11:59` -> `上午`
  - `12:00-23:59` -> `下午`
- 小时转换规则：
  - 0 点显示为 `12`
  - 13-23 点减 12
  - 12 点保持 `12`
- 分钟保持两位（`padStart(2, '0')`），小时不补零（如 `下午 3:05`）。
- 对非法时间字符串保留兜底：
  - `formatPickerTimeDisplay` 收到异常值时回退原字符串或空字符串，不抛错。

## 四、Assumptions & Decisions
- 决策 1：本次仅修改 `pages/chat/chat.vue` 的“插入时间/时间提示”链路，不扩大到其他页面（如 `chatGrop.vue`）。
- 决策 2：不改动底层时间选择控件协议（仍是 `HH:mm`），仅改 UI 文案与消息插入文案。
- 决策 3：已存在历史消息中的旧 24 小时文本不做迁移，仅对本次修改后新插入时间生效。
- 决策 4：中文文案采用 `上午`、`下午`（不使用 `AM/PM`）。

## 五、Verification Steps
- 手工验证步骤：
  - 在聊天页打开“插入时间”，选择当天 `09:05`，确认插入文案为 `上午 9:05`。
  - 选择当天 `15:20`，确认插入文案为 `下午 3:20`。
  - 选择非当天（同年）`15:20`，确认文案为 `M月D日 下午 3:20`。
  - 选择跨年日期 `09:05`，确认文案为 `YYYY年M月D日 上午 9:05`。
  - 弹窗时间行显示应为 `上午/下午` 格式，不直接显示 `15:20` 这类 24 小时文案。
- 稳定性检查：
  - 确认 `confirmTimeSelection()`、`onTimeSubmit()` 流程不受影响。
  - 修改完成后对 `chat.vue` 运行诊断，确保无新增语法/类型告警。

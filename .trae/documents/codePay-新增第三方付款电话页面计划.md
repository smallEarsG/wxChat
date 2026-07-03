# codePay 新增“第三方付款（电话）”实施计划

## Summary
- 目标：在 `pages/codePay/codePay.vue` 中基于现有“第三方付款”能力，新增一个入口“第三方付款（电话）”。
- 方案：复制现有 `ThirdpartyPayment` 为独立页面 `ThirdpartyPaymentTel`，入口点击后跳转新页面。
- 约束：新入口账单类型沿用 `billType = 4`（与“第三方付款”一致），不引入后端新类型。

## Current State Analysis
- `pages/codePay/codePay.vue` 已有“第三方付款”按钮（`goCodePayChild(2)`）和 `routeMap`/`billTypeMap` 映射逻辑。
- 当前 `goCodePayChild` 索引使用 `0~9`，并映射到不同页面；`2` 对应 `pages/ThirdpartyPayment/ThirdpartyPayment`。
- `pages/ThirdpartyPayment/ThirdpartyPayment.vue` 使用 `ThirdpartyPaymentBill` 组件，内部保存账单时固定 `billType: 4`。
- `pages.json` 已注册 `pages/ThirdpartyPayment/ThirdpartyPayment`，尚未注册 `ThirdpartyPaymentTel` 页面。
- 需求已确认：
  - 新页面为独立页面（不是复用旧路由）。
  - 新页面目录命名为 `ThirdpartyPaymentTel`。
  - 新入口位置“紧跟第三方付款”。
  - 新入口 `billType` 沿用 4。

## Proposed Changes
- 文件：`pages/codePay/codePay.vue`
  - 改什么：
    - 在“第三方付款”附近新增按钮文案“第三方付款（电话）”，点击索引新增一个未占用值（建议 `10`）。
    - 在 `routeMap` 中新增 `10 -> /pages/ThirdpartyPaymentTel/ThirdpartyPaymentTel`。
    - 在 `billTypeMap` 中新增 `10 -> 4`，并补充注释标识“第三方付款（电话）”。
  - 为什么：
    - 让新入口接入现有跳转与建单流程，且与旧模板并存、互不影响。
  - 怎么做：
    - 保持 `0~9` 既有映射不变，仅增量追加 `10`，避免历史入口行为回归风险。

- 文件：`pages/ThirdpartyPaymentTel/ThirdpartyPaymentTel.vue`（新建）
  - 改什么：
    - 复制 `pages/ThirdpartyPayment/ThirdpartyPayment.vue` 全量结构与逻辑。
    - 保留 `ThirdpartyPaymentBill` 组件复用，保留保存逻辑中的 `billType: 4`。
    - 仅做必要的页面名/注释级别区分（若存在名称字段）。
  - 为什么：
    - 满足“参考第三方付款复制一个新页面”的要求，同时不改动原页面行为。
  - 怎么做：
    - 以最小差异复制，保证功能一致性，降低引入新问题概率。

- 文件：`pages.json`
  - 改什么：
    - 新增页面注册项：`pages/ThirdpartyPaymentTel/ThirdpartyPaymentTel`。
    - 页面 `style` 与 `ThirdpartyPayment` 保持一致（`navigationStyle: custom`、禁用下拉刷新等）。
  - 为什么：
    - uni-app 新页面必须在 `pages.json` 注册后才能跳转。
  - 怎么做：
    - 在同类第三方付款页面附近插入配置，保持文件可读性。

## Assumptions & Decisions
- 已决策：新页面命名为 `ThirdpartyPaymentTel`，入口文案固定为“第三方付款（电话）”。
- 已决策：新入口独立页面实现，但账单类型不拆分，统一使用 `billType = 4`。
- 决策细则：新增索引使用 `10`，避免改动现有 `0~9` 编号带来的潜在兼容问题。

## Verification
- 静态检查
  - 确认 `pages/codePay/codePay.vue` 中新按钮存在且文案正确。
  - 确认 `routeMap[10]` 指向 `ThirdpartyPaymentTel`，`billTypeMap[10] === 4`。
  - 确认 `pages.json` 已注册 `pages/ThirdpartyPaymentTel/ThirdpartyPaymentTel`。
  - 确认新页面文件存在且可正常引用 `ThirdpartyPaymentBill`。
- 运行验证（手工）
  - 从“图文识别”页点击“第三方付款（电话）”，应可进入新页面。
  - 有扫描数据与无扫描数据两种场景均可进入，且不报错。
  - 在新页面编辑信息并触发保存后，账单创建/更新流程正常（类型保持 4）。

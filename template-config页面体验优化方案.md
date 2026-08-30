# `pages/template-config` 页面体验优化方案

## 一、当前结论

`pages/template-config/template-config.vue` 当前的问题不是功能不足，而是配置流程不符合普通用户的操作习惯。

页面把模板名称、完整预览、订单字段、条形码、服务模块、排序和保存全部放在一条长页面中，导致页面过长、来回滚动频繁，拖拽也容易和页面滚动冲突。

建议重构为：

> **字段配置 / 服务模块 / 模板预览三个标签页，底部固定保存操作栏。**

本次改造可以保持现有模板数据结构不变，历史模板继续兼容。

---

## 二、当前页面主要问题

### 1. 预览区域占据页面前半部分

当前顺序：

```text
模板名称
模板预览
订单字段
条形码设置
服务模块
```

用户修改字段后，需要向上滚动查看预览，再向下继续配置，操作流程变成：

```text
修改字段
→ 向上查看预览
→ 向下继续修改
→ 再向上查看
```

手机端使用成本较高。

### 2. 所有订单字段一次性平铺

每一行同时包含：

- 拖动图标
- 复选框
- 标签输入框
- 内部字段 Key

普通用户真正关心的只有：

- 当前显示哪些字段
- 字段显示名称
- 字段排列顺序

`currentState`、`transferOrderNumber` 等内部 Key 不应该长期占据主页面。

### 3. 未启用字段仍然占据大量空间

即使用户只启用了 6 个字段，页面仍然展示全部字段。

建议主页面只显示已启用字段：

```text
当前显示字段

1. 当前状态
2. 支付时间
3. 支付方式
4. 交易单号
5. 商户单号
6. 收单机构

+ 添加字段
```

未启用字段统一放到“添加字段”弹窗。

### 4. 拖拽和页面滚动冲突

当前拖拽事件绑定在整行：

```html
@touchstart
@touchmove
@touchend
```

用户点击输入框、复选框或者上下滚动时，都可能误触拖拽。

拖拽计算还写死：

```js
const itemHeight = 80
```

但页面实际使用 `rpx`，不同设备上的真实高度不一致，可能出现：

- 拖一下跳两项
- 拖动无反应
- 页面滚动与排序同时触发
- 排序位置不准确

### 5. 新增服务模块时内容过多

当前新增模块会直接携带完整默认服务项列表，页面会瞬间变长。

更合理的方式是新增空模块，再让用户主动选择服务项。

### 6. 保存按钮距离操作区太远

保存按钮只在顶部。用户配置完页面底部内容后，需要重新滚动到顶部。

保存成功后还会自动返回，用户无法继续确认或修改。

### 7. 条形码开关交互不稳定

建议使用 `switch` 的 `@change`：

```html
<switch
  :checked="templateConfig.showBarcode"
  color="#4A90E2"
  @change="onBarcodeChange"
/>
```

```js
onBarcodeChange(e) {
  this.templateConfig.showBarcode = e.detail.value
}
```

---

## 三、推荐页面结构

建议改成三个顶部标签：

```text
┌─────────────────────────────┐
│ 返回       自定义模板        │
├─────────────────────────────┤
│  字段配置   服务模块   预览   │
├─────────────────────────────┤
│                             │
│ 当前标签对应的内容           │
│                             │
├─────────────────────────────┤
│       恢复默认   保存模板     │
└─────────────────────────────┘
```

三个标签：

1. 字段配置
2. 服务模块
3. 模板预览

这样用户配置时只看配置，预览时只看预览，不再在超长页面中来回滚动。

---

## 四、字段配置改版方案

### 1. 主页面只展示已启用字段

```text
订单信息字段                         6 项

☰ 当前状态                    编辑
☰ 支付时间                    编辑
☰ 收单机构                    编辑
☰ 支付方式                    编辑
☰ 交易单号                    编辑
☰ 商户单号                    编辑

+ 添加字段
```

主列表不长期显示内部字段 Key。

### 2. 字段编辑使用底部弹窗

```text
编辑字段

字段名称
[ 支付时间                 ]

系统字段
time

取消                    确定
```

规则：

- 字段名称允许修改
- 字段 Key 只作为辅助信息
- 字段 Key 不允许修改

### 3. 添加字段使用选择弹窗

```text
添加订单字段

搜索字段名称

□ 收款时间
□ 商品
□ 商户全称
□ 收单机构备注
□ 支付方式备注
□ 支付说明
□ 经营单号
□ 留言/备注

取消                 添加所选字段
```

只展示尚未启用的字段，支持搜索和多选。

### 4. 字段隐藏

隐藏字段本质上只执行：

```js
field.enabled = false
```

不删除字段定义，因此不会破坏现有模板结构。

---

## 五、字段排序方案

### 推荐方案：上下移动按钮

```text
排序字段

当前状态                ↑  ↓
支付时间                ↑  ↓
支付方式                ↑  ↓
交易单号                ↑  ↓

完成排序
```

优点：

- Android、iOS、H5 都稳定
- 不会和页面滚动冲突
- 开发成本低
- 后期维护简单

示例：

```js
moveFieldUp(index) {
  if (index <= 0) return

  const fields = this.templateConfig.orderInfoFields
  const current = fields[index]

  this.$set(fields, index, fields[index - 1])
  this.$set(fields, index - 1, current)
}
```

```js
moveFieldDown(index) {
  const fields = this.templateConfig.orderInfoFields
  if (index >= fields.length - 1) return

  const current = fields[index]

  this.$set(fields, index, fields[index + 1])
  this.$set(fields, index + 1, current)
}
```

### 备选方案：保留拖拽

只在左侧拖动手柄绑定拖拽：

```html
<view
  class="drag-handle"
  @longpress="startDrag"
  @touchmove.stop.prevent="dragMove"
  @touchend="dragEnd"
>
  <uni-icons type="bars" />
</view>
```

不要再将拖拽事件绑定到整行，也不要写死项目高度。

第一版更建议使用上下移动按钮。

---

## 六、服务模块改版方案

### 1. 服务模块使用折叠卡片

```text
服务模块

┌ 账单服务                     ⋯ ┐
│ 已显示 3 个服务项               │
│ 对订单有疑惑 · 发起群收款 · 名片 │
│                         展开 >  │
└───────────────────────────────┘

+ 添加服务模块
```

### 2. 展开后只展示已启用服务项

```text
账单服务

当前服务项

☰ 对订单有疑惑
☰ 发起群收款
☰ 收款方名片

+ 添加服务项
```

### 3. 新增模块默认创建为空模块

```js
addServiceModule() {
  this.templateConfig.serviceModules.push({
    title: '新服务模块',
    items: []
  })
}
```

也可以提供模块预设：

```text
添加服务模块

○ 空白模块
○ 账单服务
○ 商户服务
○ 联系方式
```

### 4. 模块操作菜单

```text
重命名模块
复制模块
删除模块
```

删除时增加二次确认：

```js
deleteServiceModule(moduleIndex) {
  uni.showModal({
    title: '删除模块',
    content: '删除后，该模块中的服务项配置也会被删除。',
    success: (res) => {
      if (!res.confirm) return
      this.templateConfig.serviceModules.splice(moduleIndex, 1)
    }
  })
}
```

---

## 七、模板预览改版方案

预览改成独立标签页：

```text
模板预览

预览比例
75%  100%

模拟数据
微信转账  商户付款

[ 完整账单预览区域 ]

返回编辑                 保存模板
```

可增加：

- 预览比例
- 模拟数据切换
- 背景色切换
- 长图预览
- 全屏预览

字段配置和服务模块页面只保留轻量入口：

```text
已启用 6 个字段、3 个服务项      查看预览 >
```

---

## 八、底部固定操作栏

```text
恢复默认                         保存模板
```

示例：

```html
<view class="bottom-actions">
  <button class="reset-btn" @click="resetTemplate">
    恢复默认
  </button>

  <button class="save-btn" @click="saveTemplate">
    保存模板
  </button>
</view>
```

要求：

- 始终固定在底部
- 支持底部安全区域
- 左侧次要按钮
- 右侧主按钮
- 不随内容滚动

---

## 九、保存逻辑优化

保存后不要自动返回。

建议显示状态：

```text
未保存
保存中…
已保存
```

示例状态值：

```js
saveStatus: 'idle'
```

可选值：

```text
idle
dirty
saving
saved
error
```

数据发生变化：

```js
this.saveStatus = 'dirty'
```

保存完成：

```js
this.saveStatus = 'saved'
```

---

## 十、离开页面时检测未保存内容

用户修改后直接返回时提示：

```text
当前修改尚未保存

取消
不保存退出
保存并退出
```

示例：

```js
goBack() {
  if (!this.hasUnsavedChanges) {
    uni.navigateBack()
    return
  }

  uni.showModal({
    title: '修改尚未保存',
    content: '是否保存本次模板修改？',
    confirmText: '保存',
    cancelText: '不保存',
    success: async (res) => {
      if (res.confirm) {
        await this.saveTemplate(false)
      }

      uni.navigateBack()
    }
  })
}
```

---

## 十一、数据结构兼容性

当前模板数据结构：

```js
{
  orderInfoFields: [],
  serviceModules: [],
  showBarcode: false
}
```

本次改版无需修改。

字段仍然使用：

```js
{
  key: 'time',
  label: '支付时间',
  enabled: true
}
```

增加计算属性：

```js
computed: {
  enabledOrderFields() {
    return this.templateConfig.orderInfoFields.filter(item => item.enabled)
  },

  disabledOrderFields() {
    return this.templateConfig.orderInfoFields.filter(item => !item.enabled)
  }
}
```

因此：

- 旧模板继续可用
- 已保存模板不会失效
- 不需要迁移本地数据
- 自定义账单页面无需大改

---

## 十二、建议组件拆分

```text
pages/template-config/
├── template-config.vue
└── components/
    ├── TemplateBasicSettings.vue
    ├── TemplateFieldList.vue
    ├── TemplateFieldPicker.vue
    ├── TemplateFieldEditor.vue
    ├── TemplateServiceModules.vue
    ├── TemplateServicePicker.vue
    ├── TemplatePreview.vue
    └── TemplateBottomActions.vue
```

### 组件职责

#### `TemplateBasicSettings.vue`

- 模板名称
- 条形码开关
- 基础配置

#### `TemplateFieldList.vue`

- 已启用字段列表
- 上下移动
- 隐藏字段
- 打开编辑弹窗

#### `TemplateFieldPicker.vue`

- 搜索未启用字段
- 多选添加字段

#### `TemplateFieldEditor.vue`

- 编辑字段名称
- 展示字段 Key

#### `TemplateServiceModules.vue`

- 模块折叠
- 服务项排序
- 添加和删除模块

#### `TemplatePreview.vue`

- 完整预览
- 比例控制
- 模拟数据切换

#### `TemplateBottomActions.vue`

- 恢复默认
- 保存模板
- 保存状态

---

## 十三、实施优先级

### P0：优先修改

1. 预览区域改成独立标签页
2. 保存按钮固定在底部
3. 修复条形码开关事件
4. 主页面只显示已启用字段
5. 增加“添加字段”弹窗
6. 取消整行拖拽

### P1：第二阶段

1. 服务模块改为折叠卡片
2. 新增模块默认不加载全部服务项
3. 增加服务项选择弹窗
4. 增加字段编辑弹窗
5. 增加上下移动排序
6. 删除模块增加二次确认

### P2：后续优化

1. 未保存离开提醒
2. 保存状态提示
3. 恢复默认模板
4. 模板复制
5. 模板预设
6. 搜索字段和服务项
7. 全屏预览
8. 云端保存模板

---

## 十四、第一版最低改造方案

如果暂时不拆分多个组件，可以先在原页面中完成：

### 页面标签

```js
activeTab: 'fields'
```

标签值：

```text
fields
services
preview
```

### 已启用字段

```js
enabledOrderFields() {
  return this.templateConfig.orderInfoFields.filter(item => item.enabled)
}
```

### 未启用字段

```js
disabledOrderFields() {
  return this.templateConfig.orderInfoFields.filter(item => !item.enabled)
}
```

### 添加字段

```js
addField(fieldKey) {
  const field = this.templateConfig.orderInfoFields.find(
    item => item.key === fieldKey
  )

  if (field) {
    field.enabled = true
  }
}
```

### 隐藏字段

```js
hideField(fieldKey) {
  const field = this.templateConfig.orderInfoFields.find(
    item => item.key === fieldKey
  )

  if (field) {
    field.enabled = false
  }
}
```

---

## 十五、最终建议

不要继续在当前长页面上不断追加按钮和配置项。

建议直接改造成：

> **字段配置、服务模块、模板预览三个标签页，加底部固定保存栏和字段选择弹窗。**

优点：

- 不修改原有模板数据结构
- 历史模板继续兼容
- 用户操作路径明显缩短
- 页面长度显著减少
- 拖拽和滚动冲突减少
- 后续扩展模板功能更方便
- 开发改造风险可控

优先完成以下五项，页面体验就会有明显提升：

1. 预览独立
2. 只显示已启用字段
3. 添加字段弹窗
4. 上下按钮排序
5. 底部固定保存栏

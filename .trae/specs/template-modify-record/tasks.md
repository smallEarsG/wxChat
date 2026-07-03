# 自定义模板修改记录功能 - 实现计划

## [x] Task 1: 修改模板配置页面，在保存时创建修改记录
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在 `template-config.vue` 的 `saveTemplate` 方法中，保存模板成功后创建一条模板修改记录
  - 记录结构：`{ typeIndex: 2, templateId: string, templateName: string, action: 'create' | 'update', time: string, updateTime: number }`
  - 将记录追加到 `recordsList` 本地存储中
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 保存新模板后，recordsList 中新增一条 typeIndex=2 的记录
  - `programmatic` TR-1.2: 编辑模板后，recordsList 中新增一条 typeIndex=2 的记录，action 为 'update'
- **Notes**: 需要确保记录格式与现有记录兼容

## [/] Task 2: 修改修改记录页面，添加模板修改记录类型
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 在 `records.vue` 中添加 typeIndex=2（模板修改）的记录展示逻辑
  - 添加类型选项：'收款通知', '提现通知', '模板修改'
  - 设计模板修改记录的卡片样式，显示模板名称、操作类型、修改时间
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-2.1: 记录列表正确显示模板修改记录卡片
  - `human-judgment` TR-2.2: 卡片显示模板名称、操作类型（新增/编辑）、修改时间
- **Notes**: 参考现有收款通知和提现通知的卡片样式

## [ ] Task 3: 实现从修改记录跳转到模板编辑页面
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 在 `records.vue` 中添加点击模板修改记录的处理逻辑
  - 点击时携带 templateId 参数跳转到 `/pages/template-config/template-config?id=xxx`
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: 点击模板修改记录正确跳转到模板配置页面
  - `programmatic` TR-3.2: 模板配置页面正确加载对应模板数据
- **Notes**: 需要确保模板ID正确传递

## [ ] Task 4: 添加删除模板时清理相关记录的逻辑
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 在 `codePay.vue` 的 `deleteTemplate` 方法中，删除模板时同时删除相关的修改记录
- **Acceptance Criteria Addressed**: NFR-2
- **Test Requirements**:
  - `programmatic` TR-4.1: 删除模板后，recordsList 中相关的模板修改记录也被删除
- **Notes**: 需要遍历 recordsList 并过滤掉相关记录
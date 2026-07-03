# 客户详情页面时间不显示秒的实现计划

## 需求分析

用户要求：
1. `customerDetail.vue` 页面中添加时间不要精确到秒
2. 对应的时间选择弹框也要进行调整，不包含秒选择

## 代码分析

### 1. 客户详情页面时间显示 (`customerDetail.vue`)

当前逻辑：
```javascript
displayAddTime() {
    return this.detail.addTime || this.detail.createdAt || this.formatNow();
}
```

`formatNow()` 返回格式为 `yyyy-MM-dd HH:mm`（已经不包含秒），但如果 `addTime` 或 `createdAt` 包含秒，会直接显示。

### 2. 时间选择弹框

在 `ProMsgEditPopup.vue` 中使用了 `uni-datetime-picker` 组件，已设置 `:hide-second="true"`。

在 `chat.vue` 中使用了原生 `picker mode="time"`，需要检查是否包含秒。

## 实现步骤

### 步骤 1：修改 `customerDetail.vue`

添加时间格式化方法，确保显示的时间不包含秒：

```javascript
formatTimeWithoutSeconds(timeStr) {
    if (!timeStr) return '';
    // 匹配常见的时间格式：yyyy-MM-dd HH:mm:ss 或 yyyy-MM-dd HH:mm
    const match = timeStr.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})(:\d{2})?$/);
    if (match) {
        return match[1];
    }
    return timeStr;
}
```

修改 `displayAddTime` 计算属性：
```javascript
displayAddTime() {
    const rawTime = this.detail.addTime || this.detail.createdAt || this.formatNow();
    return this.formatTimeWithoutSeconds(rawTime);
}
```

### 步骤 2：检查并调整 `chat.vue` 中的时间选择器

当前使用 `picker mode="time"`，需要确认是否需要限制不显示秒。

### 步骤 3：确保时间选择器返回值不包含秒

检查 `formatSelectedTimeText` 方法，确保格式化后的时间不包含秒。

## 风险评估

- 低风险：修改时间显示格式不会影响数据存储，只影响展示
- 需要确保时间格式化方法能处理各种时间格式

## 修改文件清单

1. `pages/customerDetail/customerDetail.vue` - 添加时间格式化逻辑
2. `pages/chat/chat.vue` - 检查时间选择器配置
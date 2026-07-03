# chat.vue 消息格式文档

---

## 一、消息类型总览

| 分类 | type | contentType | 说明 |
|------|------|-------------|------|
| 提示消息 | `tips` | - | 时间提示、系统通知 |
| 文本聊天 | `content` | `chat` | 普通文本消息 |
| 对外收款 | `content` | `order` | 收款订单 |
| 转账 | `content` | `transfer` | 转账消息 |
| 收款 | `content` | `wxtf` | 微信收款 |
| 图片 | `content` | `photo` | 图片消息 |
| 红包 | `content` | `redBag` | 红包消息 |
| 文件 | `content` | `file` | 文件消息 |
| 语音 | `content` | `yuyin` | 语音消息 |
| 名片 | `content` | `crad` | 名片消息 |
| 视频通话 | `content` | `video` | 视频通话记录 |
| 语音通话 | `content` | `phone` | 语音通话记录 |

---

## 二、关键字段定义

| 字段 | 类型 | 取值 | 说明 |
|------|------|------|------|
| `type` | String | `tips` / `content` | 消息大类 |
| `contentType` | String | 见上表 | 消息子类型 |
| `location` | Number | `0` / `1` | `0`=对方(左侧)，`1`=我方(右侧) |
| `content` | Any | 随类型变化 | 消息内容 |
| `quote` | Object | 可选 | 引用消息快照 |

---

## 三、消息格式详解

### 1. 提示消息 (tips)
```json
{
  "type": "tips",
  "contentType": "chat",
  "content": "2024-01-15 10:30"
}
```

### 2. 文本消息 (chat)
```json
{
  "type": "content",
  "contentType": "chat",
  "location": 1,
  "content": "你好",
  "quote": {
    "fromName": "对方",
    "fromLocation": 0,
    "contentType": "chat",
    "previewText": "引用内容"
  }
}
```

### 3. 对外收款 (order)
```json
{
  "type": "content",
  "contentType": "order",
  "location": 1,
  "content": {
    "shopName": "店铺名称",
    "gusetName": "付款人",
    "price": "100.00"
  }
}
```

### 4. 转账消息 (transfer)
```json
{
  "type": "content",
  "contentType": "transfer",
  "location": 0,
  "content": {
    "name": "用户名",
    "amount": "500.00",
    "tip": "你发起了一笔转账",
    "st": false
  }
}
```

### 5. 收款消息 (wxtf)
```json
{
  "type": "content",
  "contentType": "wxtf",
  "location": 1,
  "content": {
    "name": "用户名",
    "amount": "200.00"
  }
}
```

### 6. 图片消息 (photo)
```json
{
  "type": "content",
  "contentType": "photo",
  "location": 0,
  "content": {
    "avatar": "http://xxx.com/img.jpg"
  }
}
```

### 7. 红包消息 (redBag)
```json
{
  "type": "content",
  "contentType": "redBag",
  "location": 1,
  "content": true
}
```

### 8. 文件消息 (file)
```json
{
  "type": "content",
  "contentType": "file",
  "location": 0,
  "content": {
    "fileType": "文档",
    "fileName": "报告.docx",
    "fileSize": "2.3MB",
    "isCop": false
  }
}
```

### 9. 语音消息 (yuyin)
```json
{
  "type": "content",
  "contentType": "yuyin",
  "location": 1,
  "content": {
    "time": 15
  }
}
```

### 10. 名片消息 (crad)
```json
{
  "type": "content",
  "contentType": "crad",
  "location": 0,
  "content": {
    "nickname": "张三",
    "avatar": "http://xxx.com/avatar.jpg"
  }
}
```

### 11. 视频通话 (video)
```json
{
  "type": "content",
  "contentType": "video",
  "location": 1,
  "content": "00:35"
}
```

### 12. 语音通话 (phone)
```json
{
  "type": "content",
  "contentType": "phone",
  "location": 0,
  "content": "已取消"
}
```

### 13. 系统提示 (tips content)
```json
{
  "type": "content",
  "contentType": "tips",
  "location": 0,
  "content": {
    "tipType": "payment",
    "gusetName": "付款人"
  }
}
```

---

## 四、tipType 类型说明

| tipType | 说明 | 显示文本 |
|---------|------|----------|
| `payment` | 收款提示 | "你收到了XXX的付款" |
| `revoke_other` | 对方撤回 | "对方撤回了一条消息" |
| `revoke_self` | 我方撤回 | "你撤回了一条消息" |
| `add_contact` | 添加好友 | "你已添加了XXX，现在可以开始聊天了" |

---

## 五、消息存储与同步

所有消息存储在 `massageList` 数组中，通过 `updateMsg()` 方法：
1. 序列化为 JSON 字符串存入 `guestInfo.content`
2. 调用 `updateConversation` API 同步到服务端

---

## 六、渲染组件映射

| contentType | 使用组件 |
|-------------|----------|
| `order` | `ExternalPayCard` |
| `transfer` | `TransferCard` |
| `wxtf` | `ChTf` |
| `redBag` | `RedBag` |
| `file` | `chatFlie` |
| `crad` | `WxCard` |
| `chat` | 自定义文本解析（表情/URL/邮箱/手机号） |

---

## 七、文件引用

- **来源文件**: [chat.vue](file:///e:/test2/wxChat2/wxChat/pages/chat/chat.vue)
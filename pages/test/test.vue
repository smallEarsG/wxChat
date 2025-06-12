<template>
  <view class="chat-container">
    <!-- 消息列表 -->
    <scroll-view scroll-y class="message-list">
      <view v-for="(msg, index) in messages" :key="index" class="message-item">
        <view class="message-content">
          <template v-for="(part, i) in parseMessage(msg)">
            <text v-if="part.type === 'text'" :key="i">{{ part.content }}</text>
            <image v-else-if="part.type === 'emoji'" :key="i" :src="getEmojiUrl(part.index)" class="emoji-inline" />
          </template>
        </view>
      </view>
    </scroll-view>

    <!-- 输入框 -->
    <view class="input-bar">
      <input v-model="inputValue" class="input" placeholder="请输入内容..." />
      <button class="btn" @click="sendMsg">发送</button>
    </view>

    <!-- Emoji 选择面板 -->
    <view class="emoji-picker">
      <view v-for="index in total" :key="index" class="emoji-item" @click="onSelect(index)">
        <image :src="getEmojiUrl(index)" class="emoji-img"></image>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      inputValue: '',
      total: 108
    }
  },
  methods: {
    onSelect(index) {
      // 插入表情占位符
      this.inputValue += `[emoji_${index}]`;
    },

    sendMsg() {
      if (this.inputValue.trim() !== '') {
        this.messages.push(this.inputValue);
        this.inputValue = '';
      }
    },

    parseMessage(msg) {
      const result = [];
      const regex = /\[emoji_(\d+)\]/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(msg)) !== null) {
        if (match.index > lastIndex) {
          result.push({
            type: 'text',
            content: msg.substring(lastIndex, match.index)
          });
        }
        result.push({
          type: 'emoji',
          index: parseInt(match[1])
        });
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < msg.length) {
        result.push({
          type: 'text',
          content: msg.substring(lastIndex)
        });
      }
      return result;
    },

    getEmojiUrl(index) {
      return `/static/emoji/emoji${index}.png`;
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.message-list {
  flex: 1;
  /* background: red; */
  padding: 10px;
}

.message-item {
  margin-bottom: 10px;
}

.message-content {
  font-size: 16px;
  word-break: break-word;
}

.input-bar {
  display: flex;
  padding: 10px;
  background: #fff;
  border-top: 1px solid #eee;
}

.input {
  flex: 1;
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding-left: 10px;
}

.btn {
  margin-left: 10px;
  background-color: #007AFF;
  color: white;
  padding: 0 15px;
  border-radius: 5px;
  line-height: 40px;
}

.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  padding: 5px;
  /* background: #fff; */
  /* border-top: 1px solid #eee; */
}

.emoji-item {
  width: 32px;
  height: 34px;
  margin: 3px;
}

.emoji-img {
  width: 100%;
  height: 100%;
}

.emoji-inline {
  width: 20px;
  height: 24px;
  vertical-align: middle;
  margin: 0 1px;
}
</style>

<template>
  <view>
    <!-- 弹出表单 -->
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view class="form-header">
          <text class="title">插入消息</text>
          <view class="close-btn" @click="closePopup">
            <uni-icons type="close" size="24" color="#666" />
          </view>
        </view>
        
        <view class="form-body">
          <!-- 消息内容 -->
          <view class="form-item">
            <text class="form-label">消息内容</text>
            <view class="input-wrapper">
              <uni-icons type="message" size="18" color="#999" class="input-icon" />
              <textarea 
                v-model="messageContent" 
                class="form-textarea" 
                placeholder="请输入要插入的消息内容"
                placeholder-class="placeholder"
                :auto-height="true"
                :maxlength="500"
              />
            </view>
          </view>
          
          <!-- 表情选择器 -->
          <view class="emoji-section">
            <view class="emoji-toggle" @click="toggleEmojiPicker">
              <uni-icons type="face" size="20" color="#007aff" />
              <text class="emoji-toggle-text">{{ showEmojiPicker ? '隐藏表情' : '选择表情' }}</text>
            </view>
            
            <view class="emoji-picker" v-show="showEmojiPicker">
              <scroll-view class="emoji-scroll" scroll-y>
                <view class="emoji-grid">
                  <view 
                    v-for="index in emojiTotal" 
                    :key="index" 
                    class="emoji-item" 
                    @click="addEmoji(index)"
                  >
                    <image 
                      :src="getEmojiUrl(index)" 
                      class="emoji-img" 
                      mode="aspectFit"
                      @error="handleEmojiError"
                    />
                  </view>
                </view>
              </scroll-view>
            </view>
          </view>
        </view>
        
        <view class="form-footer">
          <button class="btn-cancel" @click="closePopup">取消</button>
          <button class="btn-submit" @click="submit">插入</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'MessageInsertPopup',
  data() {
    return {
      messageContent: '',
      showEmojiPicker: false,
      emojiTotal: 50 // 减少表情总数，避免性能问题
    };
  },
  methods: {
    // 打开弹窗
    open(content = '') {
      try {
        this.messageContent = content || '';
        this.showEmojiPicker = false;
        
        if (this.$refs.popup) {
          this.$refs.popup.open('center');
        } else {
          console.error('弹窗引用不存在');
          uni.showToast({
            title: '弹窗打开失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('打开消息插入弹窗时发生错误:', error);
        uni.showToast({
          title: '弹窗打开失败',
          icon: 'none'
        });
      }
    },
    
    // 关闭弹窗
    closePopup() {
      try {
        if (this.$refs.popup) {
          this.$refs.popup.close();
        }
        this.showEmojiPicker = false;
        this.messageContent = '';
      } catch (error) {
        console.error('关闭消息插入弹窗时发生错误:', error);
      }
    },
    
    // 切换表情选择器
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    
    // 添加表情
    addEmoji(index) {
      this.messageContent += `[emoji_${index}]`;
    },
    
    // 获取表情URL
    getEmojiUrl(index) {
      return `/static/emoji/emoji_${index}.png`;
    },
    
    // 处理表情图片加载错误
    handleEmojiError(e) {
      console.warn('表情图片加载失败:', e.target.src);
    },
    
    // 提交表单
    submit() {
      if (!this.messageContent.trim()) {
        uni.showToast({
          title: '消息内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      // 发送提交事件，返回消息内容
      this.$emit('submit', {
        msg: this.messageContent.trim()
      });
      
      // 关闭弹窗
      this.closePopup();
    }
  }
};
</script>

<style scoped>
/* 弹窗整体样式 */
.popup-content {
  width: 680rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 表单头部 */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

/* 表单主体 */
.form-body {
  padding: 40rpx;
  flex: 1;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 36rpx;
}

.form-label {
  font-size: 28rpx;
  margin-bottom: 16rpx;
  display: block;
  color: #666;
}

/* 输入框样式 */
.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 24rpx;
  top: 24rpx;
  z-index: 1;
}

.form-textarea {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 24rpx 24rpx 24rpx 68rpx;
  width: 100%;
  font-size: 28rpx;
  min-height: 120rpx;
  box-sizing: border-box;
  transition: border-color 0.2s;
  resize: none;
}

.form-textarea:focus {
  border-color: #007aff;
  outline: none;
}

.placeholder {
  color: #bbb;
}

/* 表情选择器样式 */
.emoji-section {
  margin-top: 20rpx;
}

.emoji-toggle {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  cursor: pointer;
}

.emoji-toggle-text {
  margin-left: 12rpx;
  font-size: 28rpx;
  color: #007aff;
}

.emoji-picker {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  margin-top: 16rpx;
  background-color: #fafafa;
  max-height: 320rpx;
  overflow: hidden;
}

.emoji-scroll {
  height: 280rpx;
  padding: 20rpx;
}

.emoji-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.emoji-item {
  width: 80rpx;
  height: 80rpx;
  margin: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  transition: background-color 0.2s;
}

.emoji-item:hover {
  background-color: #e6e6e6;
}

.emoji-item:active {
  background-color: #d0d0d0;
}

.emoji-img {
  width: 48rpx;
  height: 48rpx;
}

/* 表单底部按钮 */
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-top: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border-radius: 16rpx;
  font-size: 30rpx;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  color: #666;
  background-color: #f5f5f5;
  margin-right: 20rpx;
}

.btn-cancel:hover {
  background-color: #f0f0f0;
}

.btn-submit {
  color: #fff;
  background-color: #007aff;
}

.btn-submit:hover {
  background-color: #0062cc;
}

.btn-submit:active {
  background-color: #0052a8;
}
</style>

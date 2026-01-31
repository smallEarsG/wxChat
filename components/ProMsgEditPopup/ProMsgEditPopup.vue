<template>
  <view>
    <!-- 弹出表单 -->
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view class="form-header">
          <text class="title">{{ isEditing ? '编辑对话' : '添加对话' }}</text>
          <view class="close-btn" @click="closePopup">
            <uni-icons type="close" size="24" color="#666" />
          </view>
        </view>
        
        <view class="form-body">
          <!-- 头像选择 -->
          <view class="form-item">
            <text class="form-label">头像</text>
            <view class="avatar-section">
              <view class="avatar-preview" @tap="chooseAvatar" @click="chooseAvatar">
                <image 
                  v-if="formData.avatarUrl" 
                  :src="formData.avatarUrl" 
                  class="avatar-img"
                  mode="aspectFill"
                />
                <view v-else class="avatar-placeholder">
                  <uni-icons type="camera" size="24" color="#999" />
                  <text class="placeholder-text">点击选择头像</text>
                </view>
              </view>
              <view class="random-btn" @tap="randomGenerate" @click="randomGenerate" title="随机生成">
                <uni-icons type="reload" size="20" color="#007aff" />
                <text class="random-btn-text">随机</text>
              </view>
            </view>
          </view>
          
          <!-- 姓名输入 -->
          <view class="form-item">
            <text class="form-label">姓名</text>
            <view class="input-wrapper">
              <uni-icons type="person" size="18" color="#999" class="input-icon" />
              <input 
                v-model="formData.name" 
                class="form-input" 
                placeholder="请输入姓名"
                placeholder-class="placeholder"
                maxlength="20"
              />
            </view>
          </view>
          
          <!-- 描述输入 -->
          <view class="form-item">
            <text class="form-label">描述</text>
            <view class="input-wrapper">
              <uni-icons type="info" size="18" color="#999" class="input-icon" />
              <input 
                v-model="formData.description" 
                class="form-input" 
                placeholder="请输入描述（如：@微信）"
                placeholder-class="placeholder"
                maxlength="50"
              />
            </view>
          </view>
          
          <!-- 时间设置 -->
          <view class="form-item">
            <text class="form-label">时间</text>
            <view class="input-wrapper">
              <uni-icons type="time" size="18" color="#999" class="input-icon" />
              <input 
                v-model="formData.createdAt" 
                class="form-input" 
                placeholder="请输入时间（如：上午 8:15）"
                placeholder-class="placeholder"
                maxlength="20"
              />
            </view>
          </view>
          
          <!-- 消息数量 -->
          <view class="form-item">
            <text class="form-label">消息数量</text>
            <view class="input-wrapper">
              <uni-icons type="chatboxes" size="18" color="#999" class="input-icon" />
              <input 
                v-model.number="formData.chatIndex" 
                class="form-input" 
                placeholder="请输入消息数量"
                placeholder-class="placeholder"
                type="number"
                min="0"
              />
            </view>
          </view>
          
          <!-- 消息内容 - 只在编辑模式下显示 -->
        <!--  <view class="form-item" v-if="isEditing">
            <text class="form-label">消息内容</text>
            <view class="input-wrapper">
              <uni-icons type="message" size="18" color="#999" class="input-icon" />
              <textarea 
                v-model="formData.content" 
                class="form-textarea" 
                placeholder="请输入消息内容"
                placeholder-class="placeholder"
                :auto-height="true"
                :maxlength="500"
              />
            </view>
          </view> -->
          
          <!-- 表情选择器 - 只在编辑模式下显示 -->
         <!-- <view class="emoji-section" v-if="isEditing">
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
          </view> -->
        </view>
        
        <view class="form-footer">
          <button class="btn-cancel" @click="closePopup">取消</button>
          <button class="btn-submit" @click="submit">{{ isEditing ? '保存' : '添加' }}</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'ProMsgEditPopup',
  props: {
    // 消息信息对象
    msgInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      formData: {
        conversationId: '',
        avatarUrl: '',
        name: '',
        description: '',
        createdAt: '',
        chatIndex: 0,
        content: '',
        type: 'chat'
      },
      showEmojiPicker: false,
      emojiTotal: 50, // 减少表情总数，避免性能问题
      isEditing: false,
      isOpening: false // 标记弹窗是否正在打开
    };
  },
  methods: {
    // 生成随机用户名（可以是真实姓名或网名）
    generateRandomName() {
      // 随机决定生成真实姓名还是网名
      if (Math.random() > 0.5) {
        // 生成真实姓名
        const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧'];
        const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '建华', '文', '华', '红', '建国', '辉', '鹏'];
        const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
        const randomName = names[Math.floor(Math.random() * names.length)];
        // 随机决定是否添加第二个字
        if (Math.random() > 0.5) {
          const secondName = names[Math.floor(Math.random() * names.length)];
          return randomSurname + secondName + randomName;
        }
        return randomSurname + randomName;
      } else {
        // 生成网名
        const nicknames = [
          '风轻云淡', '岁月如歌', '梦里花落', '星空下的约定', '阳光正好', '时光荏苒',
          '浅笑安然', '流年似水', '清风徐来', '墨染年华', '烟雨江南', '落花有意',
          '云淡风轻', '月下独酌', '一叶知秋', '春暖花开', '夏夜微凉', '秋意浓',
          '冬日暖阳', '星辰大海', '梦里寻她', '不负韶华', '初心不改', '诗和远方',
          '小确幸', '大梦想', '追光者', '夜未央', '晨光熹微', '暮色苍茫',
          'Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'Grace', 'Henry',
          'Iris', 'Jack', 'Kate', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul',
          'Rainbow', 'Sunny', 'Moon', 'Star', 'Ocean', 'River', 'Mountain', 'Forest',
          '小可爱', '大魔王', '小仙女', '小王子', '小星星', '小太阳', '小月亮',
          '追风少年', '阳光女孩', '温柔如你', '霸气侧漏', '低调奢华', '高调炫富',
          '123456', 'abc123', 'user2024', 'test001', 'demo', 'admin', 'guest'
        ];
        return nicknames[Math.floor(Math.random() * nicknames.length)];
      }
    },
    
    // 获取随机头像地址
    getRandomAvatar() {
      // 使用多个头像服务API，随机选择
      const avatarServices = [
        // DiceBear 头像生成服务（多种风格）
        () => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random().toString(36).substring(7),
        () => 'https://api.dicebear.com/7.x/personas/svg?seed=' + Math.random().toString(36).substring(7),
        () => 'https://api.dicebear.com/7.x/initials/svg?seed=' + Math.random().toString(36).substring(7),
        // UI Avatars 服务
        () => 'https://ui-avatars.com/api/?name=' + Math.random().toString(36).substring(7) + '&background=random&color=fff',
        // Picsum 随机图片
        () => 'https://picsum.photos/200/200?random=' + Date.now(),
        // RandomUser 真实头像
        () => 'https://randomuser.me/api/portraits/men/' + Math.floor(Math.random() * 99) + '.jpg',
        () => 'https://randomuser.me/api/portraits/women/' + Math.floor(Math.random() * 99) + '.jpg',
      ];
      
      // 随机选择一个头像服务并调用
      const randomService = avatarServices[Math.floor(Math.random() * avatarServices.length)];
      return randomService();
    },
    
    // 打开弹窗
    open(msgInfo = {}) {
      try {
        // 设置正在打开标志，防止意外触发事件
        this.isOpening = true;
        
        // 判断是编辑还是新增
        const isEditing = !!msgInfo.conversationId;
        
        // 如果是新增模式且没有提供名称和头像，则自动生成随机值
        let avatarUrl = msgInfo.avatarUrl || '';
        let name = msgInfo.name || '';
        
        if (!isEditing) {
          // 新增模式：如果没有提供头像和名称，则自动生成
          if (!avatarUrl) {
            avatarUrl = this.getRandomAvatar();
          }
          if (!name) {
            name = this.generateRandomName();
          }
        }
        
        // 重置表单数据
        this.formData = {
          conversationId: msgInfo.conversationId || '',
          avatarUrl: avatarUrl,
          name: name,
          description: msgInfo.description || '@微信',
          createdAt: msgInfo.createdAt || '上午 8:15',
          chatIndex: msgInfo.chatIndex || 0,
          content: msgInfo.content || '',
          type: msgInfo.type || 'chat'
        };
        
        // 判断是编辑还是新增
        this.isEditing = isEditing;
        
        // 确保弹窗引用存在
        if (this.$refs.popup) {
          this.$refs.popup.open('center');
          // 延迟清除标志，确保弹窗完全打开后再允许交互
          // 使用 nextTick 确保 DOM 更新完成，然后短暂延迟
          this.$nextTick(() => {
            setTimeout(() => {
              this.isOpening = false;
              console.log('弹窗打开完成，允许交互');
            }, 100);
          });
        } else {
          console.error('弹窗引用不存在');
          this.isOpening = false;
          uni.showToast({
            title: '弹窗打开失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('打开弹窗时发生错误:', error);
        this.isOpening = false;
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
        this.isEditing = false;
        this.isOpening = false; // 重置打开标志
        // 重置表单数据
        this.resetForm();
      } catch (error) {
        console.error('关闭弹窗时发生错误:', error);
      }
    },
    
    // 重置表单
    resetForm() {
      this.formData = {
        conversationId: '',
        avatarUrl: '',
        name: '',
        description: '@微信',
        createdAt: '上午 8:15',
        chatIndex: 0,
        content: '',
        type: 'chat'
      };
    },
    
    // 选择头像
    chooseAvatar(e) {
      console.log('chooseAvatar 被调用', {
        isOpening: this.isOpening,
        event: e
      });
      
      // 防止弹窗打开时意外触发（只在很短时间内阻止，避免影响正常点击）
      if (this.isOpening) {
        console.log('弹窗正在打开，延迟50ms后执行');
        setTimeout(() => {
          this.doChooseAvatar();
        }, 50);
        return;
      }
      
      this.doChooseAvatar();
    },
    
    // 实际执行选择头像的方法
    doChooseAvatar() {
      console.log('执行选择头像');
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          console.log('选择头像成功', res.tempFilePaths[0]);
          this.formData.avatarUrl = res.tempFilePaths[0];
        },
        fail: (err) => {
          console.error('选择头像失败:', err);
          uni.showToast({
            title: '选择头像失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 随机生成头像和名称
    randomGenerate() {
      // 生成随机头像和名称
      this.formData.avatarUrl = this.getRandomAvatar();
      this.formData.name = this.generateRandomName();
      
      // 提示用户
      uni.showToast({
        title: '已随机生成',
        icon: 'success',
        duration: 1500
      });
    },
    
    // 切换表情选择器
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    
    // 添加表情
    addEmoji(index) {
      this.formData.content += `[emoji_${index}]`;
    },
    
    // 获取表情URL
    getEmojiUrl(index) {
      return `/static/emoji/emoji_${index}.png`;
    },
    
    // 处理表情图片加载错误
    handleEmojiError(e) {
      console.warn('表情图片加载失败:', e.target.src);
    },
    
    // 表单验证
    validateForm() {
      if (!this.formData.name.trim()) {
        uni.showToast({
          title: '请输入姓名',
          icon: 'none'
        });
        return false;
      }
      
      if (!this.formData.avatarUrl) {
        uni.showToast({
          title: '请选择头像',
          icon: 'none'
        });
        return false;
      }
      
      if (!this.formData.createdAt.trim()) {
        uni.showToast({
          title: '请输入时间',
          icon: 'none'
        });
        return false;
      }
      
      // 编辑模式下验证消息内容（新增模式下不需要）
      if (this.isEditing && !this.formData.content.trim()) {
        uni.showToast({
          title: '请输入消息内容',
          icon: 'none'
        });
        return false;
      }
      
      return true;
    },
    
    // 提交表单
    submit() {
      if (!this.validateForm()) {
        return;
      }
      
      // 构造提交数据，保持与原有接口一致
      const submitData = {
        conversationId: this.formData.conversationId,
        avatarUrl: this.formData.avatarUrl,
        name: this.formData.name.trim(),
        description: this.formData.description.trim(),
        createdAt: this.formData.createdAt.trim(),
        chatIndex: Number(this.formData.chatIndex) || 0,
        content: this.formData.content.trim(),
        type: this.formData.type
      };
      
      // 发送提交事件
      this.$emit('submit', submitData);
      
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

/* 头像选择样式 */
.avatar-section {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 16rpx;
  gap: 20rpx;
}

.avatar-preview {
  width: 120rpx;
  height: 120rpx;
  border: 2rpx dashed #e6e6e6;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-preview:hover {
  border-color: #007aff;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 14rpx;
  pointer-events: none; /* 让图片不阻止点击事件，事件会冒泡到父容器 */
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.placeholder-text {
  font-size: 24rpx;
  margin-top: 8rpx;
  text-align: center;
}

/* 随机生成按钮样式 */
.random-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16rpx 24rpx;
  background-color: #f5f7fa;
  border: 1rpx solid #e6e6e6;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80rpx;
}

.random-btn:active {
  background-color: #e8ecf0;
  transform: scale(0.95);
}

.random-btn-text {
  font-size: 22rpx;
  color: #007aff;
  margin-top: 4rpx;
}

/* 输入框样式 */
.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.form-input {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 24rpx 24rpx 24rpx 68rpx;
  width: 100%;
  font-size: 28rpx;
  height: 80rpx;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #007aff;
  outline: none;
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
<template>
  <view>
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view class="form-header">
          <text class="title">编辑服务详情</text>
          <view class="close-btn" @click="$refs.popup.close()">
            <uni-icons type="close" size="24" color="#666" />
          </view>
        </view>
        
        <view class="form-body">
          <!-- 图标上传 -->
          <view class="form-item">
            <text class="label">应用图标</text>
            <view class="icon-box" @click="chooseImage">
              <image :src="icon" class="icon" v-if="icon" mode="aspectFill" />
              <text v-else class="icon-placeholder">点击上传图标</text>
            </view>
          </view>
          
          <!-- 名称输入 -->
          <view class="form-item">
            <text class="label">应用名称</text>
            <input 
              v-model="name" 
              class="form-input" 
              placeholder="请输入应用名称"
              :class="{ 'input-error': !name.trim() }"
            />
            <view class="error-message" v-if="!name.trim()">
              应用名称不能为空
            </view>
          </view>
        </view>
        
        <view class="form-footer">
          <button class="btn-cancel" @click="$refs.popup.close()">取消</button>
          <button class="btn-submit" @click="submit">提交</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'ServerInfoEditPopup',
  data() {
    return {
      icon: '',
      name: ''
    };
  },
  methods: {
    open(initialData = {}) {
      // 设置初始数据
      this.icon = initialData.icon || '';
      this.name = initialData.name || '';
      this.$refs.popup.open('center');
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.icon = res.tempFilePaths[0];
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    submit() {
      if (!this.name.trim()) {
        uni.showToast({
          title: '应用名称不能为空',
          icon: 'none'
        });
        return;
      }
      
      this.$emit('submit', {
        icon: this.icon,
        name: this.name.trim()
      });
      this.$refs.popup.close();
    }
  }
};
</script>

<style scoped>
/* 弹窗整体样式 */
.popup-content {
  width: 600rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

/* 表单头部 */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
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
}

.form-item {
  margin-bottom: 36rpx;
}

.label {
  font-size: 28rpx;
  margin-bottom: 16rpx;
  display: block;
  color: #666;
}

/* 图标上传区域 */
.icon-box {
  width: 120rpx;
  height: 120rpx;
  background: #f0f0f0;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #ccc;
  transition: border-color 0.2s;
}

.icon-box:hover {
  border-color: #007aff;
}

.icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.icon-placeholder {
  color: #999;
  font-size: 24rpx;
  text-align: center;
}

/* 输入框样式 */
.form-input {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 24rpx;
  width: 100%;
  font-size: 28rpx;
  height: 88rpx;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #007aff;
  outline: none;
}

.input-error {
  border-color: #ff5252;
}

.error-message {
  color: #ff5252;
  font-size: 24rpx;
  margin-top: 10rpx;
}

/* 表单底部按钮 */
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border-radius: 16rpx;
  font-size: 30rpx;
  transition: all 0.2s;
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




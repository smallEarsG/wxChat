<template>
  <view>
    <uni-popup ref="popup" type="center">
      <view class="popup-card">
        <view class="popup-header">
          <view class="header-icon">📷</view>
          <view>
            <text class="header-title">上传图片</text>
            <text class="header-subtitle">为聊天内容添加自定义图片</text>
          </view>
        </view>

        <view class="upload-area" :class="{ 'has-image': avatar }" @click="chooseImage">
          <image v-if="avatar" :src="avatar" class="preview-image" mode="aspectFill" />
          <view v-else class="upload-placeholder">
            <view class="upload-icon">+</view>
            <text class="upload-text">点击或轻触上传</text>
            <text class="upload-hint">支持 JPG / PNG，建议尺寸 1080×1920</text>
          </view>
          <view class="reupload-tag" v-if="avatar">重新选择</view>
        </view>

        <view class="tips">
          <text>提示：可用于聊天插图、转账凭证等展示，确保图片清晰。</text>
        </view>

        <view class="button-group">
          <button class="btn ghost" @click="closePopup">取消</button>
          <button class="btn primary" @click="submit" :disabled="!avatar">完成上传</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'ProfileEditPopup',
  data() {
    return {
      avatar: '',
    };
  },
  methods: {
    open() {
      this.$refs.popup.open('center');
    },
    closePopup() {
      this.$refs.popup.close();
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.avatar = res.tempFilePaths[0];
        }
      });
    },
    submit() {
      if (!this.avatar) {
        uni.showToast({
          title: '请先选择图片',
          icon: 'none'
        });
        return;
      }

      this.$emit('submit', {
        avatar: this.avatar,
        
      });
      this.closePopup();
    }
  }
};
</script>

<style scoped>
.popup-card {
  width: 620rpx;
  background: #ffffff;
  border-radius: 32rpx;
  padding: 40rpx 36rpx;
  box-shadow: 0 30rpx 60rpx rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.header-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #eff3ff, #dae4ff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
}

.header-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #111827;
}

.header-subtitle {
  display: block;
  font-size: 26rpx;
  color: #6b7280;
  margin-top: 4rpx;
}

.upload-area {
  border: 2rpx dashed #cbd5f5;
  border-radius: 24rpx;
  padding: 40rpx;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease;
  background: #f9faff;
}

.upload-area.has-image {
  border-style: solid;
  padding: 0;
}

.upload-area:active {
  border-color: #7c3aed;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  color: #4b5563;
}

.upload-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 2rpx dashed #d3daf5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42rpx;
  color: #7c3aed;
}

.upload-text {
  font-size: 30rpx;
  font-weight: 500;
}

.upload-hint {
  font-size: 24rpx;
  color: #9ca3af;
}

.preview-image {
  width: 100%;
  height: 420rpx;
  object-fit: cover;
  display: block;
}

.reupload-tag {
  position: absolute;
  bottom: 24rpx;
  right: 24rpx;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}

.tips {
  margin-top: 28rpx;
  font-size: 24rpx;
  color: #6b7280;
  background: #f7f7fb;
  border-radius: 16rpx;
  padding: 18rpx 24rpx;
}

.button-group {
  display: flex;
  gap: 24rpx;
  margin-top: 36rpx;
}

.btn {
  flex: 1;
  padding: 24rpx 0;
  border-radius: 16rpx;
  font-size: 28rpx;
  border: none;
}

.btn.primary {
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  color: #fff;
  box-shadow: 0 15rpx 30rpx rgba(99, 102, 241, 0.25);
}

.btn.primary:disabled {
  background: #c4c6f6;
  box-shadow: none;
}

.btn.ghost {
  background: #f3f4f6;
  color: #4b5563;
}
</style>


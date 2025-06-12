<template>
  <view>
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view class="form-header">
          <text class="form-title">群聊信息</text>
          <text class="form-subtitle">编辑群名称和简介</text>
        </view>

        <view class="form-content">
          <view class="form-item">
            <text class="label">群名</text>
            <view class="input-container">
              <input 
                v-model="nickname" 
                class="input-field" 
                placeholder="请输入群名" 
                @focus="onInputFocus"
                @blur="onInputBlur"
              />
            </view>
          </view>

          <view class="form-item">
            <text class="label">介绍</text>
            <view class="textarea-container">
              <textarea 
                v-model="description" 
                class="textarea-field" 
                placeholder="请输入简介" 
                @focus="onInputFocus"
                @blur="onInputBlur"
              />
            </view>
          </view>
        </view>

        <view class="form-actions">
          <button 
            class="submit-button" 
            @click="submit"
            :class="{ 'submit-button--active': nickname.trim() }"
          >
            提交
          </button>
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
      nickname: '',
      description: '@微信',
      isInputFocused: false
    };
  },
  methods: {
    open() {
      this.$refs.popup.open('center');
    },
    
    submit() {
      if (!this.nickname.trim()) {
        return uni.showToast({ title: '昵称不能为空', icon: 'none' });
      }
      this.$emit('submit', {
        nickname: this.nickname,
        description: this.description
      });
      this.$refs.popup.close();
    },
    
    onInputFocus() {
      this.isInputFocused = true;
    },
    
    onInputBlur() {
      this.isInputFocused = false;
    }
  }
};
</script>

<style scoped>
.popup-content {
  width: 680rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  padding: 0;
}

.form-header {
  padding: 40rpx 40rpx 20rpx;
  background-color: #f9f9f9;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
}

.form-subtitle {
  font-size: 24rpx;
  color: #999999;
}

.form-content {
  padding: 30rpx 40rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  font-size: 28rpx;
  font-weight: 500;
  color: #555555;
  margin-bottom: 15rpx;
  display: block;
}

.input-container,
.textarea-container {
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  transition: all 0.2s ease;
  background-color: #fcfcfc;
  border: 1rpx solid #e8e8e8;
}

.input-container:focus-within,
.textarea-container:focus-within {
  border-color: #007aff;
  background-color: #ffffff;
  box-shadow: 0 0 0 3rpx rgba(0, 122, 255, 0.15);
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333333;
  background-color: transparent;
}

.textarea-field {
  min-height: 140rpx;
  line-height: 1.5;
}

.form-actions {
  padding: 0 40rpx 40rpx;
}

.submit-button {
  width: 100%;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s ease;
  background-color: #e0e0e0;
  color: #999999;
}

.submit-button--active {
  background-color: #007aff;
  color: #ffffff;
}

.submit-button--active:hover {
  background-color: #006ee6;
  transform: translateY(-2rpx);
}

.submit-button--active:active {
  background-color: #0062cc;
  transform: translateY(0);
}
</style>

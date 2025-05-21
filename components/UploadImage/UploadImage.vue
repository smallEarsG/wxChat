<template>
  <view>
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view class="form-item">
          <view class="avatar-box" @click="chooseImage">
            <image :src="avatar" class="avatar" v-if="avatar" mode="aspectFill" />
            <text v-else class="avatar-placeholder">点击上传</text>
          </view>
        </view>


        <button class="btn" @click="submit">提交</button>
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
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.avatar = res.tempFilePaths[0];
        }
      });
    },
    submit() {
    
      this.$emit('submit', {
        avatar: this.avatar,
        
      });
      this.$refs.popup.close();
    }
  }
};
</script>

<style scoped>
.popup-content {
  width: 600rpx;
  background-color: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
}
.form-item {
  margin-bottom: 30rpx;
}
.label {
  font-size: 28rpx;
  margin-bottom: 10rpx;
  display: block;
  color: #333;
}
.avatar-box {
  width: 120rpx;
  height: 120rpx;
  background: #f0f0f0;
  /* border-radius: 50%; */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar {
  width: 100%;
  height: 100%;
  /* border-radius: 50%; */
}
.avatar-placeholder {
  color: #999;
  font-size: 24rpx;
}
.input {
  border: 1px solid #ccc;
  border-radius: 8rpx;
  padding: 10rpx;
  width: 100%;
  font-size: 28rpx;
}
.textarea {
  border: 1px solid #ccc;
  border-radius: 8rpx;
  padding: 10rpx;
  width: 100%;
  height: 120rpx;
  font-size: 28rpx;
}
.btn {
  background-color: #007aff;
  color: #fff;
  padding: 16rpx;
  text-align: center;
  border-radius: 8rpx;
}
</style>

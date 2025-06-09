<template>
  <view class="wx-card">
    <view class="cardleft">
    	<view class="header">
    	  <image class="logo" src="/static/icon-wechat.png" />
    	  <text class="platform">微信</text>
    	</view>
    	<view class="nickname">{{ nickname }}</view>
    	<view class="tag">个人名片</view>
    </view>
	<view class="avatarbox">
		    <image class="avatar" :src="avatar" />
	</view>
  </view>
</template>

<script>
export default {
  name: 'WxCard',
  props: {
    nickname: {
      type: String,
      default: '昵称'
    },
    avatar: {
      type: String,
      default: '/static/icon-avatar-placeholder.png' // 默认头像
    }
  }
}
</script>

<style scoped>
.wx-card {
  background: #fff;
  padding: 30rpx 30rpx 20rpx 30rpx;
  display: flex;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  width: 480rpx;
  box-sizing: border-box;
  position: relative;
  justify-content:space-between;
  margin-left: 14rpx;
  
}
/* .wx-card::after {
		content: "";
		position: absolute;
		top: 28rpx;
		left: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #fff;
	} */
.header {
  display: flex;
  justify-content: space-between;
  /* align-items: center; */
  margin-bottom: 10rpx;
}
.logo {
  width: 40rpx;
  height: 40rpx;
  margin-right: 10rpx;
}
.platform {
  font-size: 26rpx;
  color: #666;
  flex: 1;
}
.avatar {
  width: 100rpx;
  height: 100rpx;
  background: #d8eaff;
  border-radius: 8rpx;
}
.nickname {
  font-size: 38rpx;
  font-weight: bold;
  margin-top: 30rpx;
  margin-bottom: 20rpx;
}
.tag {
  font-size: 24rpx;
  color: #aaa;
}
</style>

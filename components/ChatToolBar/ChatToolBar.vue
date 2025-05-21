<template>
  <scroll-view class="chat-toolbar" scroll-x  :show-scrollbar="false">
    <view class="tool-item" @click="onClick({ label: '客户跟进' })">
      <view class="icon-circle" >
        <image src="/static/icon-follow.png" class="tool-icon_follow" />
      </view>
      <text class="tool-label">客户跟进</text>
    </view>

    <view class="tool-item" @click="onClick({ label: '发起收款' })">
      <view class="icon-circle" >
        <image src="/static/icon-pay-green.png" class="tool-icon_pay" />
      </view>
      <text class="tool-label">发起收款</text>
    </view>

    <view class="tool-item" @click="onClick({ label: '客户转账' })">
      <view class="icon-circle" >
        <image src="/static/icon-transfer.png" class="tool-icon" />
      </view>
      <text class="tool-label">客户转账</text>
    </view>

    <view class="tool-item" @click="onClick({ label: '快捷回复' })">
      <view class="icon-circle" >
        <image src="/static/icon-reply.png" class="tool-icon_reply" />
      </view>
      <text class="tool-label">快捷回复</text>
    </view>
	<view class="tool-item" @click="onClick({ label: '快捷回复' })">
	  <view class="icon-circle" >
	    <image src="/static/icon-user.png" class="tool-icon_reply" />
	  </view>
	  <text class="tool-label">客户详情</text>
	</view>
  </scroll-view>
</template>

<script>
export default {
  name: 'ChatToolBar',
  methods: {
    onClick(item) {
      this.$emit('click', item);
    }
  }
};
</script>

<style scoped>
.chat-toolbar {
  /* width: 100%; */
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  padding: 20rpx 10rpx;	
  background-color: #f5f5f5;
  padding-bottom: 0;
  text-align: center;
  align-self: center;
}
.chat-toolbar ::-webkit-scrollbar {
  display: none;
}
.tool-item {
  /* height: 70rpx; */
  display: inline-flex;
  align-items: center;
  background-color: #ffffff;
  padding: 8rpx 20rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.icon-circle {
/*  width: 40rpx;
  */
  height: 40rpx; 
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10rpx;
  /* background-color: aqua; */
  overflow: hidden;
}

.tool-icon {
  margin: 6rpx 0;
  width: 26rpx;
  height: 26rpx;
}

.tool-icon_follow{
	width: 34rpx;
	height: 34rpx;
}
.tool-icon_pay{
	width: 34rpx;
	height: 34rpx;
}
.tool-icon_reply{
	width: 30rpx;
	height: 30rpx;
}
.tool-label {
  font-size: 20rpx;
  color: #333;
}
</style>

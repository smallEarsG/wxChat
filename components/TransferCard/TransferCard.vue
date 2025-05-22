<template>
  <view class="transfer-card">
    <!-- <view class="flag"></view> -->
    <view class="content">
      <view class="left-icon">
        <image class="icon" src="/static/icon_transfer.png" />
      </view>
      <view class="info">
        <view class="title">向{{ name }}转账</view>
        <view class="amount">￥{{ amount }}</view>
        <view class="desc">请收款</view>
      </view>
    </view>
    <view class="bottom-bar">
      <view class="left">转账</view>
      <view class="right">企业</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TransferCard',
  props: {
    name: { type: String, required: true },
    amount: { type: [Number, String], required: true }
  }
}
</script>

<style scoped>
.transfer-card {
  background-color: #f99d3b;
  color: #fff;
  border-radius: 16rpx;
  /* overflow: hidden; */
  width: 500rpx;
  position: relative;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
  margin-left: 14rpx;
  box-sizing: border-box;
}
.transfer-card::after {
		content: "";
		position: absolute;
		top: 28rpx;
		left: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #f99d3b;
	}

.content {
  display: flex;
  padding: 20rpx 30rpx 20rpx;
  align-items: center;
}
.left-icon{
	border-radius: 50%;
	border: #fff 5rpx solid ;
	margin-right: 10rpx;
	padding: 14rpx;
	box-sizing: border-box;
	/* height: 100%; */
	 display: flex;
	 text-align: center;
	 align-items: center;
}
.left-icon .icon {
  width: 54rpx;
  height: 54rpx;
  /* background-color: red; */
  
}
.info {
  flex: 1;
}
.title {
  font-size: 32rpx;
  font-weight: bold;
  /* margin-bottom: 10rpx; */
}
.amount {
  font-size: 32rpx;
  /* font-weight: bold; */
}
.desc {
  font-size: 24rpx;
  opacity: 0.9;
  margin-top: 4rpx;
}
.bottom-bar {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 30rpx 20rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}
</style>

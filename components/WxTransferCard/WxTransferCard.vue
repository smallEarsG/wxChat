<template>
  <view class="transfer-card" :class="state?'f3bg':'f9bg'">
    <!-- <view class="flag"></view> -->
    <view class="content">
      <view class="left-icon">
        <image class="icon_" v-if="state" src="/static/images/wechat-trans-icon2.png" />
		<image class="icon" v-else src="/static/icon_transfer1.png" mode=""></image>
      </view>
      <view class="info">
        <!-- <view class="title">向{{ name }}转账</view> -->
        <view class="title">￥{{ amount }}</view>
        <view class="desc">{{state?'已被接收':name}}</view>
      </view>
    </view>
	<view class="line" />
    <view class="bottom-bar">
      <view class="left">微信转账</view>
      <!-- <view class="right">企业</view> -->
    </view>
  </view>
</template>

<script>
export default {
  name: 'TransferCard',
  props: {
	state:{type:Boolean},
    name: { type: String, },
    amount: { type: [Number, String], required: true }
  }
}
</script>

<style scoped>
	.f3bg{
		background-color:#fce1c3
	}
	.f9bg{
		  background-color: #f99d3b;
	}
.transfer-card {
  /* background-color: #f99d3b; */
  color: #fff;
  border-radius: 16rpx;
  /* overflow: hidden; */
  width: 430rpx;
  position: relative;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
  /* margin-left: 14rpx; */
  box-sizing: border-box;
}
.line{
		width: 90%;
		height: 2rpx;
		margin-bottom: 6rpx;
		transform: scaleY(0.1);
		margin: 0 auto;
		background-color: #fff;
	}
.content {
  display: flex;
  padding: 20rpx 30rpx 18rpx;
  align-items: center;
}
.left-icon{
	border-radius: 50%;
	/* border: #fff 5rpx solid ; */
	margin-right: 20rpx;
	/* padding: 10rpx; */
	box-sizing: border-box;
	/* height: 100%; */
	 display: flex;
	 text-align: center;
	 align-items: center;
}
.left-icon .icon {
  width: 74rpx;
  height: 74rpx;
  /* background-color: red; */
  
}
.left-icon .icon_{
	width: 64rpx;
	height: 64rpx;
}
.info {
  flex: 1;
}
.title {
  font-size: 30rpx;
  font-weight: 700;
  /* margin-bottom: 10rpx; */
}
.amount {
  font-size: 32rpx;
  /* font-weight: bold; */
}
.desc {
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 2rpx;
}
.bottom-bar {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 30rpx 10rpx;
  font-size: 22rpx;
  color: rgba(243, 243, 243, 0.9);
}
</style>

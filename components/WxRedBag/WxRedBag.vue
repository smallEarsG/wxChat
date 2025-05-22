<template>
  <view class="transfer-card" :class="state?'f9bg':'f3bg'">
    <!-- <view class="flag"></view> -->
    <view class="content">
      <view class="left-icon">
        <image class="icon" :src="state?'/static/images/wechat-trans-icon3.png':'/static/images/wechat-trans-icon4.png'" />
      </view>
      <view class="info">
        <!-- <view class="title">向{{ name }}转账</view> -->
        <view class="title">恭喜发财，大吉大利</view>
      </view>
    </view>
	<view class="line" />
    <view class="bottom-bar">
      <view class="left">微信红包</view>
      <!-- <view class="right">企业</view> -->
    </view>
  </view>
</template>

<script>
export default {
  name: 'TransferCard',
  props: {
	state:{type:Boolean}
  }
}
</script>

<style scoped>
	.line{
		width: 90%;
		height: 2rpx;
		margin-bottom: 6rpx;
		transform: scaleY(0.1);
		margin: 0 auto;
		background-color: #fff;
	}
.f3bg{
	background-color:#fce1c3
}
.f9bg{
	  background-color: #f99d3b;
}
.transfer-card {

  color: #fff;
  border-radius: 16rpx;
  /* overflow: hidden; */
  width: 430rpx;
  position: relative;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
  /* margin-left: 14rpx; */
  box-sizing: border-box;
  /* display: flex;
  flex-direction: column;
  align-items: center; */
}
/* .transfer-card::after {
		content: "";
		position: absolute;
		top: 28rpx;
		left: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #f99d3b;
	} */

.content {
  display: flex;
  padding: 20rpx 30rpx 10rpx;
  align-items: center;
}
.left-icon{
	border-radius: 50%;
	/* border: #fff 5rpx solid ; */
	margin-right: 10rpx;
	padding: 14rpx;
	box-sizing: border-box;
	/* height: 100%; */
	 display: flex;
	 text-align: center;
	 align-items: center;
}
.left-icon .icon {
  width: 62.5rpx;
  height: 76rpx;
  /* height: 64rpx; */
  /* background-color: red; */
  
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

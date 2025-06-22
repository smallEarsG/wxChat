<template>
  <view class="transfer-card">
    <!-- <view class="flag"></view> -->
    <view class="content">
      <view class="left-icon">
        <image class="icon" src="/static/images/tf_2.png" />
      </view>
      <view class="info">
      <view class="title" :style="{ fontSize: rpx(32) }">向{{ name }}转账</view>
      <view class="amount" :style="{ fontSize: rpx(32) }">￥{{ amount }}</view>
      <view class="desc" :style="{ fontSize: rpx(24) }">已收款</view>
        <!-- <view class="desc">已收款</view> -->
      </view>
    </view>
	<view class="line" />
    <view class="bottom-bar" :style="{ fontSize: rpx(24) }">
    <view class="left">转账</view>
    <view class="right">企业</view>
    </view>
  </view>
</template>

<script>
import scaleMixin from '@/mixins/scaleMixin.js'
export default {
 mixins: [scaleMixin],
  name: 'TransferCard',
  props: {
	  
    name: { type: String,},
    amount: { type: [Number, String], required: true }
  }
}
</script>

<style scoped>
.transfer-card {
  background-color: #fce1c3;
  color: #fff;
  border-radius: 16rpx;
  /* overflow: hidden; */
   width: 460rpx;
  position: relative;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
  /* margin-right: 14rpx; */
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
  padding: 20rpx 30rpx 20rpx;
  align-items: center;
}
.left-icon{
	border-radius: 50%;
	/* border: #fff 5rpx solid ; */
	margin-right: 10rpx;
	/* padding: 10rpx; */
	box-sizing: border-box;
	/* height: 100%; */
	 display: flex;
	 text-align: center;
	 align-items: center;
}
.left-icon .icon {
 width: 84rpx;
  height:84rpx;
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
  font-size: 26rpx;
  opacity: 0.9;
  margin-top: 2rpx;
}
.bottom-bar {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 30rpx 20rpx;
  font-size: 22rpx;
  color: rgba(243, 243, 243, 0.9);
}
</style>

<template>
	<view style="position: relative ;">
		<view class="transfer-card"  :class="state?'f9bg':'f3bg'">
			<!-- <view class="flag"></view> -->
			<view class="content">
				<view class="left-icon">
					<image class="icon" :src="state?'/static/qiw/redbag.png':'/static/qiw/redbag2.png'" />
				</view>
				<view class="info">
					<!-- <image src="/static/qiw/redbag.png"></image> -->
					<!-- <view class="title">向{{ name }}转账</view> -->
					<view class="title">恭喜发财，大吉大利</view>
					<view class="desc" v-if="!state">
						红包已领取
					</view>
				</view>
			</view>
			<view class="line" v-if="state" />
			<view class="bottom-bar">
				<view class="left">红包</view>
				<!-- <view class="right">企业</view> -->
			</view>
		</view>
		<view class="tip" v-if="!state">
			<image class="miniRedBag" src="/static/qiw/wechat-trans-icon3.png" mode=""></image>
			<text>{{location==0?`你领取了${name}的`:`${name}领取了你的`}}</text><text style="color: red;">红包</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'TransferCard',
		props: {
			state: {
				type: Boolean
			},
			name:{
				type:String
			},
			location:{
				type:Number
			}
		}
	}
</script>

<style scoped>
	.tip{
		margin: 0 auto;
		display: flex;
		font-size: 24rpx;
		/* text-align: center;
		width: 100%; */
		align-items: center;
		justify-content: center;
		margin-top: 30rpx;
		color: #9d9ea2;
	}
	.miniRedBag{
		width: 30rpx;
		height: 40rpx;
		margin-right: 10rpx;
		position: relative;
		top:8rpx
	}
	.line {
		width: 90%;
		height: 2rpx;
		margin-bottom: 6rpx;
		transform: scaleY(0.1);
		margin: 0 auto;
		background-color: #fff;
	}

	.f3bg {
		background-color: #f69e94
	}

	.f9bg {
		background-color: #ff624f;
	}

	.transfer-card {

		color: #fff;
		border-radius: 16rpx;
		/* overflow: hidden; */
		width: 460rpx;
		position: relative;
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
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
		padding: 20rpx 20rpx 10rpx;
		align-items: center;
		justify-content: center;
		margin-bottom: 20rpx;
		
	}

	.left-icon {
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
		width: 90rpx;
		height: 90rpx;
		/* height: 64rpx; */
		/* background-color: red; */

	}

	.info {
		flex: 1;
		color: #fbf8d1;
		/* margin-bottom: 40rpx; */
		display: flex;
		flex-direction: column;
		justify-content: center;
		/* align-items: center; */
		/* height: 100%;
   background-color: #fff; */
	}

	.title {
		font-size: 32rpx;
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
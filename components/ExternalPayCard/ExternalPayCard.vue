<template>
	<view>
		
	
	<view class="payment-card">
		<!-- 顶部 -->
		<view class="header">
			<image src="/static/icon-pay-green.png" class="icon" />
			<text class="label">对外收款</text>
		</view>

		<!-- 文本 -->
		<view class="title">
			付款给 {{orderInfo.shopName }}
		</view>

		<!-- 中间卡片区域 -->
		<view class="card">
			<view class="card-header">
				<image src="/static/wx-icon.png" class="icon_wx" />
				企业微信 · 对外收款
			</view>
			<view class="circle"></view>
			<view class="amount">￥{{ orderInfo.price }}</view>
			<view class="btn" @click="onPay">付款</view>
		</view>

		<!-- 底部小程序标志 -->
		<view class="miniapp-footer">
			<image src="/static/icon-miniapp.png" class="miniapp-icon" />
			<text>小程序</text>
		</view>
	</view>
	<view class="tips">
		你收到了{{orderInfo.gusetName}}的付款<text class="blueTxt"> 查看</text>
	</view>
	</view>
</template>

<script>
	export default {
		name: "ExternalPayCard",
		props: {
			orderInfo: {
				type: Object,
				default: {}
			}
		},
		methods: {
			onPay() {
				// 模拟支付逻辑
				// uni.showToast({
				// 	title: `已付款 ￥${this.amount}`,
				// 	icon: 'success'
				// });
			}
		}
	};
</script>

<style scoped>
	.tips{
		text-align: center;
		color: #999;
		font-size: 24rpx;
		margin: 20rpx 0 ;
	}
	.blueTxt{
		color: #468dd4;
	    margin-left: 10rpx;
	}
	.payment-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 20rpx;
		width: 500rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		font-size: 28rpx;
		position: relative;
		margin-right: 14rpx;
	}
.payment-card::after {
	  content: "";
	  position: absolute;
	  top: 28rpx;
	  right: -10rpx;
	  width: 0;
	  height: 0;
	  border-top: 6px solid transparent;
	  border-bottom: 6px solid transparent;
	  border-left: 6px solid #ffffff;
	}
	.header {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.icon {
		width: 50rpx;
		height: 50rpx;
		margin-right: 10rpx;
	}

	.label {
		/* color: #3cb371; */
		/* font-weight: bold; */
		color: #999;
		font-size: 24rpx;
	}
	.icon_wx{
		width: 60rpx;
		height: 50rpx;
	}

	.title {
		font-size: 32rpx;
		margin-bottom: 20rpx;
	}

	.card {
		border: 8rpx solid transparent;
		border-image: linear-gradient(to bottom right, #3086ff, #54adff);
		border-image-slice: 1;
		border-radius: 10rpx;
		overflow: hidden;
		background-color: #ffffff;
		text-align: center;
		padding-bottom: 20rpx;
	}

	.card-header {
		background-color: #3086ff;
		color: white;
		padding: 20rpx;
		font-size: 30rpx;
		/* font-weight: 600; */
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		/* overflow: hidden */

	}

	.circle {
		width: 100%;
		position: relative;
		height: 30px;
		z-index: 1;
	}

	.circle::before {
		content: "";
		position: absolute;
		bottom: 80%;
		left: -50%;
		/* 调整水平位置 */
		width: 200%;
		/* 调整宽度 */
		height: 270%;
		/* 调整高度 */
		background-color: #3086ff;
		border-radius: 50%;
		z-index: 1;
	}

	.amount {
		font-size: 48rpx;
		font-weight: bold;
		margin-top: 20rpx;
		margin-bottom: 30rpx;
	}

	.btn {
		background-color: #3086ff;
		color: white;
		border-radius: 8rpx;
		padding: 17rpx 0;
		width: 50%;
		font-size: 32rpx;
		margin: 30rpx auto;
		/* font-weight: bold; */

	}

	.miniapp-footer {
		padding-top: 16rpx;
		display: flex;
		align-items: center;
		margin-top: 20rpx;
		font-size: 24rpx;
		color: #999;
		border-top:2rpx solid #f5f5f5 ;
	}

	.miniapp-icon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 8rpx;
	}
</style>

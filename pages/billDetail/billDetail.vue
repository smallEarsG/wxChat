<template>
	<view class="container">
		<view class="info">
			<view class="bg" />
			<view class="avatar">
				<image src="/static/paySe.png"></image>
			</view>
			<view class="name">
				用户
				<uni-icons type="right" size="14"></uni-icons>
			</view>
			<view class="money">
				+561.00
			</view>
			<view class="transaction">
				交易成功
			</view>
			<view class="orderInfo">
				<view class="info-item">
					<view class="left">创建时间</view>
					<view class="right">s2025年6月25日16:59:17</view>
				</view>
				<view class="info-item">
					<view class="left">备注</view>
					<view class="right">s2025年6月25日16:59:17</view>
				</view>
				<view class="info-item">
					<view class="left">对方账号</view>
					<view class="right">s2025年6月25日16:59:17</view>
				</view>
				<view class="info-item">
					<view class="left">服务推荐</view>
					<view class="right"></view>
				</view>
				<view class="blue-tip">
					恭喜你有6元转账保障福利待领取 <uni-icons type="right" size="14"></uni-icons>
				</view>
				<view class="info-item">
					<view class="left">订单号</view>
					<view class="right">111333333333333333333</view>
				</view>
			</view>
		</view>
		<view class="Bill">
			<view class="title">
				账单管理
			</view>
			<view class="yellow-tip">
				本月转账红包是最大支出目录，看看花在了哪里？ <uni-icons type="right" size="14"></uni-icons>
			</view>
			<view class="bill-item">
				<view class="left">账单分类</view>
				<view class="right">转账红包</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {

		}
	}
</script>

<style>
	.blue-tip {
		display: flex;
		justify-content: space-between;
		width: 100%;
		padding: 10upx 20rpx;
		box-sizing: border-box;
		align-items: center;
		/* background-color: red; */
	}

	.info-item {
		padding: 20upx 0upx;
		display: flex;
		justify-content: space-between;
		/* background-color: antiquewhite; */
		width: 100%;
	}

	.orderInfo {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		flex-direction: column;
		padding: 0 20upx;
		width: 100%;
		/* background-color: aqua; */
		box-sizing: border-box;
		/* flex:1 */
	}

	.transaction {
		position: relative;
		z-index: 1;
	}

	.money {
		position: relative;
		z-index: 1;
		font-size: 40upx;
	}

	.name {
		position: relative;
		z-index: 1;
		font-size: 24upx;
		padding: 20upx 0;
		display: flex;
		align-items: center;
	}

	.bg {
		background-color: #fff;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		top: 35upx;
		z-index: 0;
	}

	.avatar {
		width: 70upx;
		height: 70upx;
		overflow: hidden;
	}

	.avatar image {
		width: 100%;
		height: 100%;
	}

	.info {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.container {
		height: 100vh;
		background-color: #eaeaea;
		display: flex;
		flex-direction: column;
		padding: 40upx;
	}
</style>
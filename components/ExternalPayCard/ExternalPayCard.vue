<template>
	<view>
		
	
	<view class="payment-card" :style="paymentCardStyle">
		<!-- 顶部 -->
		<view class="header" :style="headerStyle">
			<image src="/static/icon-pay-green.png" class="icon" :style="iconStyle" />
			<text class="label" :style="labelStyle">对外收款</text>
		</view>

		<!-- 文本 -->
		<view class="title" :style="titleStyle">
			付款给 {{orderInfo.shopName }}
		</view>

		<!-- 中间卡片区域 -->
		<view class="card" :style="cardStyle">
			<view class="card-header" :style="cardHeaderStyle">
				<image src="/static/wx-icon.png" class="icon_wx" :style="iconWxStyle" />
				企业微信 · 对外收款
			</view>
			<view class="circle" :style="circleStyle"></view>
			<view class="amount" :style="amountStyle">￥{{ orderInfo.price }}</view>
			<view class="btn" :style="btnStyle" @click="onPay">付款</view>
		</view>

		<!-- 底部小程序标志 -->
		<view class="miniapp-footer" :style="miniappFooterStyle">
			<image src="/static/icon-miniapp.png" class="miniapp-icon" :style="miniappIconStyle" />
			<text>小程序</text>
		</view>
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
			},
			fontScale: {
				type: Number,
				default: 1
			}
		},
		computed: {
			paymentCardStyle() {
				return {
					'--font-scale': this.fontScale,
					borderRadius: this.rs(16),
					padding: this.rs(20),
					width: this.rs(460),
					boxShadow: `0 ${this.rs(2)} ${this.rs(10)} rgba(0, 0, 0, 0.05)`,
					fontSize: this.rs(28),
					marginRight: this.rs(14)
				}
			},
			headerStyle() {
				return {
					marginBottom: this.rs(10)
				}
			},
			iconStyle() {
				return {
					width: this.rs(50),
					height: this.rs(50),
					marginRight: this.rs(10)
				}
			},
			labelStyle() {
				return {
					fontSize: this.rs(24)
				}
			},
			iconWxStyle() {
				return {
					width: this.rs(60),
					height: this.rs(50)
				}
			},
			titleStyle() {
				return {
					fontSize: this.rs(32),
					marginBottom: this.rs(20)
				}
			},
			cardStyle() {
				return {
					borderWidth: this.rs(8),
					borderRadius: this.rs(10),
					paddingBottom: this.rs(20)
				}
			},
			cardHeaderStyle() {
				return {
					padding: this.rs(20),
					fontSize: this.rs(30)
				}
			},
			circleStyle() {
				return {
					height: this.rs(30)
				}
			},
			amountStyle() {
				return {
					fontSize: this.rs(48),
					marginTop: this.rs(20),
					marginBottom: this.rs(30)
				}
			},
			btnStyle() {
				return {
					borderRadius: this.rs(8),
					padding: `${this.rs(17)} 0`,
					fontSize: this.rs(32),
					margin: `${this.rs(30)} auto`
				}
			},
			miniappFooterStyle() {
				return {
					paddingTop: this.rs(16),
					marginTop: this.rs(20),
					fontSize: this.rs(24),
					borderTopWidth: this.rs(2)
				}
			},
			miniappIconStyle() {
				return {
					width: this.rs(32),
					height: this.rs(32),
					marginRight: this.rs(8)
				}
			}
		},
		methods: {
			rs(value) {
				return `${value * this.fontScale}rpx`
			},
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
	.payment-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 20rpx;
		width: 460rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		font-size: 28rpx;
		position: relative;
		margin-right: 14rpx;
	}
.payment-card::after {
	  content: "";
	  position: absolute;
	  top: calc(28rpx * var(--font-scale, 1));
	  right: calc(-10rpx * var(--font-scale, 1));
	  width: 0;
	  height: 0;
	  border-top: calc(6px * var(--font-scale, 1)) solid transparent;
	  border-bottom: calc(6px * var(--font-scale, 1)) solid transparent;
	  border-left: calc(6px * var(--font-scale, 1)) solid #ffffff;
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

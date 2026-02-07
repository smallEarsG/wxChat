<template>
	<view class="bill-container">
		<!-- 导航栏 -->
		<view class="nav" :style="{ paddingTop: (previewMode ? 20 : statusBarHeight) + 'px' }">
			<uni-icons v-if="!previewMode" class="close" type="closeempty" color="#000" size="22" @click="$emit('goBack')"></uni-icons>
			<uni-icons v-else class="close" type="closeempty" color="#000" size="22"></uni-icons>
			<view class="allOrder" v-if="info.order" :style="{ fontSize: (36 * fontScale) + 'rpx' }">全部账单</view>
		</view>

		<view class="content">
			<view class="order" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="order_top">
					<view class="avatar" @click="handleAvatarClick">
						<image :src="info.url||'/static/paySe.png'"></image>
					</view>
					<view class="name" :style="{ fontSize: (32 * fontScale) + 'rpx' }">
						二维码收款-{{info.name}}
					</view>
					<view class="num" @click="handleMoneyClick" :style="{ fontSize: (56 * fontScale) + 'rpx' }">
						{{info.money}}
					</view>
					<view class="line" />
				</view>

				<view class="order_info">
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">当前状态</view>
						<view class="right">{{info.currentState}}</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">收款方备注</view>
						<view class="right">{{info.desc}}</view>
					</view>
					<view class="item" v-if="info.payment" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">收款方式</view>
						<view class="right rightIcon">
							{{info.payment}}
							<uni-icons v-if="info.payment == '零钱通'" type="info" size="18" color="#999" class="input-icon gthIcon" />
						</view>
					</view>
					<view class="item" v-if="info.otherTime" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">收款时间</view>
						<view class="right">{{info.otherTime}}</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">转账单号</view>
						<view class="right">{{info.orderNumber}}</view>
					</view>
				</view>
			</view>
		
			<view class="footer" :style="{ fontSize: (24 * fontScale) + 'rpx' }">
				本服务由财付通提供
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'CodePayChildBill',
		props: {
			info: {
				type: Object,
				default: () => ({})
			},
			previewMode: {
				type: Boolean,
				default: false
			},
			statusBarHeight: {
				type: Number,
				default: 0
			}
		},
		computed: {
			fontScale() {
				return (this.info.fontSize || 100) / 100;
			}
		},
		methods: {
			handleAvatarClick() {
				if (!this.previewMode) {
					this.$emit('changeRole');
				}
			},
			handleMoneyClick() {
				if (!this.previewMode) {
					this.$emit('editInfo');
				}
			}
		}
	}
</script>

<style scoped>
	.bill-container {
		background-color: #eaeaea;
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}
	
	.nav {
		background-color: #fff;
		height: 86rpx;
		position: relative;
		flex-shrink: 0;
	}
	
	.allOrder {
		position: absolute;
		right: 40upx;
		font-size: 36upx;
		bottom: 10upx;
	}
	
	.close {
		padding-left: 20rpx;
		position: relative;
		top: 30rpx;
		transform: scale(0.8);
	}

	.order {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background-color: #fff;
		padding: 0 60rpx;
	}
	
	.order_top {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.avatar {
		width: 94rpx;
		height: 94rpx;
		overflow: hidden;
		margin-top: 40rpx;
		border-radius: 50px;
	}

	.avatar image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.name {
		margin-top: 30rpx;
		font-size: 32rpx;
		text-align: center;
	}
	
	.num {
		font-family: 'WeChat Sans Std';
		display: flex;
		align-items: center;
		margin-top: 40rpx;
		font-size: 56rpx;
	}
	
	.line {
		margin-top: 88rpx;
		width: 100%;
		height: 1px;
		background-color: #efefef;
		transform: scaleY(0.6);
	}
	
	.order_info {
		margin-top: 40rpx;
		padding-bottom: 60rpx;
		font-family: 'msyh';
		display: flex;
		flex-direction: column;
	}
	
	.item {
		flex: 1;
		display: flex;
		font-size: 28rpx;
		margin-bottom: 20rpx;
	}
	
	.left {
		color: #9b9b9b;
		width: 170rpx;
	}
	
	.right {
		flex: 1;
		word-wrap: break-word; 
		overflow-wrap: break-word;
		overflow: auto;
	}
	
	.rightIcon {
		display: flex;
		align-items: center;
	}
	
	.gthIcon {
		margin-left: 10rpx;
	}
	
	.footer {
		width: 100%;
		flex: 1;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-direction: column;
		color: #a2a2a2;
		min-height: 170rpx;
		padding-bottom: 60rpx;
	}
</style>

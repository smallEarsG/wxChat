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
						<image :src="info.url||'/static/logo.png'"></image>
					</view>
					<view class="name" :style="{ fontSize: (32 * fontScale) + 'rpx' }">
						{{info.name}}
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
						<view class="left">支付时间</view>
						<view class="right">{{info.time}}</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">商品</view>
						<view class="right">{{info.shop}}</view>
					</view>
					<view class="item" v-if="info.merchantName" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">商户全称</view>
						<view class="right">{{info.merchantName}}</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">收单机构</view>
						<view class="right">
							<view> {{info.institution}}</view>
							<view class="tips" v-if="info.desc" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
								{{info.desc}}
							</view>
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">支付方式</view>
						<view class="right">
							<view class="rightIcon">
								{{info.payment}}
								<uni-icons v-if="info.payment == '零钱通'" type="info" size="18" color="#999" class="input-icon gthIcon" />
							</view>
							<view class="tips" v-if="info.desc2" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
								{{info.desc2}}
							</view>
						</view>
					</view>

					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">交易单号</view>
						<view class="right">{{info.orderNumber}}</view>
					</view>

					<view class="item" v-if="info.shopNumber" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">商户单号</view>
						<view class="right">{{info.shopNumber}}</view>
					</view>
				</view>
			</view>
			
			<view class="mini" style="align-items: center;" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx', fontSize: (28 * fontScale) + 'rpx' }">
				<view class="left" style="color: black;">商家小程序</view>
				<view class="right_mini">
					<image class="miniapp" mode="widthFix" src="/static/qiw/miniIcon.png"></image>
					<text class="miniName">{{info.miniName}} </text>
					<uni-icons type="right" color="#9b9b9b" size="17"></uni-icons>
				</view>
			</view>

			<view class="serivce" v-if="info.showService !== false" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="se_title" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
					账单服务
				</view>
				<view class="serivce_line">
					<view class="serivce_bx">
						<view class="se_item" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
							<view class="se_icon">
								<image class="wticon" src="/static/wticon.png" mode=""></image>
							</view>
							对订单有疑惑
						</view>
						<view class="se_item" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
							<view class="se_icon">
								<image class="chatIcon" src="/static/qiw/tpicon_1.png" mode=""></image>
							</view>
							发起群收款
						</view>
					</view>
					<view class="serivce_bx">
						<view class="se_item" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
							<view class="se_icon">
								<image class="startIcon" src="/static/qiw/tpIcon_2.png" mode=""></image>
							</view>
							在此商户的交易
						</view>
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
		name: 'MiniThirdpartyPaymentBill',
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
		width: 92rpx;
		height: 92rpx;
		overflow: hidden;
		margin-top: 40rpx;
		border-radius: 50%;
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
		background-color: #eaeaea;
	}
	
	.order_info {
		margin-top: 40rpx;
		padding-bottom: 60rpx;
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
		color: #878787;
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
	
	.tips {
		margin-top: 12rpx;
		color: #9b9b9b;
		font-size: 26rpx;
	}
	
	.mini {
		flex: 1;
		display: flex;
		font-size: 28rpx;
		margin-top: 20rpx;
		background-color: #fff;
		padding: 30rpx 60rpx;
	}
	
	.right_mini {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex: 1;
	}
	
	.miniapp {
		width: 26rpx;
	}
	
	.miniName {
		margin: 0 14rpx;
		color: #878787;
	}
	
	.serivce {
		margin-top: 20rpx;
		background-color: #fff;
		padding: 0 60rpx;
		box-sizing: border-box;
	}
	
	.se_title {
		font-size: 28rpx;
		padding-top: 30rpx;
		padding-bottom: 35rpx;
		box-sizing: border-box;
	}
	
	.serivce_line {
		border-top: 1px solid #eaeaea;
	}
	
	.serivce_bx {
		display: flex;
		align-items: center;
		margin: 35rpx 0;
		box-sizing: border-box;
	}
	
	.se_item {
		font-size: 26rpx;
		color: #5c6e96;
		flex: 1;
		display: flex;
		align-items: center;
	}
	
	.wticon {
		width: 30rpx;
		height: 30rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
	}
	
	.startIcon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 12rpx;
		position: relative;
		top: 6rpx;
	}
	
	.chatIcon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
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

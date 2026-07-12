<template>
	<view class="container" :class="{ 'preview-mode': previewMode }">
		<view class="nav" v-if="!previewMode" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-icons class="close" type="closeempty" color="#000" size="22"></uni-icons>
			<view v-if="isIos" class="nav-title">
				账单
			</view>
			<view class="allOrder" v-if="info.order" @click.stop="exitInfo" :style="{ fontSize: (36 * fontScale) + 'rpx' }">全部账单</view>
		</view>
		<view class="content">
			<view class="order" @click="exitInfo" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="order_top">
					<view class="avatar" @click.stop="changeRole">
						<image :src="info.url||'/static/paySe.png'"></image>
					</view>
					<view class="name" :style="{ fontSize: (32 * fontScale) + 'rpx' }">
						{{info.name}}
					</view>
					<view class="num" :style="{ fontSize: (56 * fontScale) + 'rpx' }">
						{{info.money}}
					</view>
					<view class="line" />
				</view>

				<view class="order_info">
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							当前状态
						</view>
						<view class="right">
							{{info.currentState}}
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							支付时间
						</view>
						<view class="right">
							{{info.time}}
						</view>
					</view>
					<view class="item" v-if="info.shop" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							商品
						</view>
						<view class="right">
							{{info.shop}}
						</view>
					</view>
					<view class="item" v-if="info.merchantName" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							商户全称
						</view>
						<view class="right">
							{{info.merchantName}}
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							收单机构
						</view>
						<view class="right">
							<view> {{info.institution}}</view>
							<view class="tips" v-if=" info.desc" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
								{{info.desc}}
							</view>
						</view>
					</view>
					<view class="item">
						<view class="left">
							支付方式
						</view>
						<view class="right  ">
							<view class="rightIcon">
								{{info.payment}}
								<uni-icons v-if=" info.payment == '零钱通'" type="info" size="18" color="#999"
									class="input-icon gthIcon" />
								<view v-if=" info.payment == '分付'" class="selectInfo">
									查看详情
								</view>
							</view>
							<view class="tips" v-if=" info.desc2" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
								{{info.desc2}}
							</view>

						</view>
					</view>
					<view class="item" v-if="info.payDesc">
						<view class="left">
							支付说明
						</view>
						<view class="right">
							{{info.payDesc}}
						</view>
					</view>
					<view class="item">
						<view class="left">
							交易单号
						</view>
						<view class="right">
							{{info.orderNumber}}
						</view>
					</view>

					<view class="item">
						<view class="left">
							商户单号
						</view>
						<view class="right">
							可在支持的商户扫码退款
						</view>
					</view>
					<view class="item">
						<view class="right">
							<view class="barCodeBox">
								<BarcodeGenerator v-if="info.shopNumber != ''"  :width="'300px'" :content="info.shopNumber" />
							</view>
							<view class="codeNo">
								{{info.shopNumber || "请输入商户单号" }}
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="serivce" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="se_title">
					账单服务
				</view>
				<view class="serivce_line">
					<view class="serivce_bx">
						<view class="se_item">
							<view class="se_icon ">
								<image class="wticon" src="/static/wticon.png" mode=""></image>
							</view>
							对订单有疑惑
						</view>
						<view class="se_item">
							<view class="se_icon ">
								<image class="chatIcon" src="/static/qiw/tpicon_1.png" mode=""></image>
							</view>
							发起群收款
						</view>
					</view>
				</view>
			</view>

			<view class="footer">
				本服务由财付通提供
			</view>
		</view>
	</view>
</template>

<script>
	import BarcodeGenerator from '@/components/BarcodeGenerator/BarcodeGenerator.vue'

	export default {
		name: 'BarcodeThirdpartyPayment34Bill',
		components: {
			BarcodeGenerator
		},
		props: {
			info: {
				type: Object,
				default: () => ({})
			},
			previewMode: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
			}
		},
		computed: {
			isIos() {
				return uni.getSystemInfoSync().platform === 'ios';
			},
			fontScale() {
				return (this.info.fontSize || 100) / 100;
			}
		},
		methods: {
			goBack() {
				this.$emit('goBack');
			},
			changeRole() {
				this.$emit('changeRole');
			},
			exitInfo() {
				if (!this.previewMode) {
					this.$emit('exitInfo');
				}
			}
		}
	}
</script>

<style scoped>
	.list_rl {
		flex: 1;
		overflow: auto;
	}

	.roleList {
		display: flex;
		flex-direction: column;
		width: 600rpx;
		height: 800rpx;
	}

	.gthIcon {
		margin-left: 10rpx;
	}

	.rightIcon {
		display: flex;
		align-items: center;
	}

	.barCodeBox {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 40rpx;

	}

	.codeNo {
		margin-top: 10rpx;
		text-align: center;
		font-size: 30upx;
	}

	.tips {
		margin-top: 12rpx;
		color: #9b9b9b;
		font-size: 26rpx;
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

	.serivce {
		margin-top: 20rpx;
		background-color: #fff;
		padding: 0 60rpx;
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

	.se_title {
		font-size: 28rpx;
		padding-top: 30rpx;
		padding-bottom: 35rpx;
		box-sizing: border-box;
	}

	.se_item {
		font-size: 26rpx;
		color: #5c6e96;
		flex: 1;
		display: flex;
		align-items: center;
	}

	.se_icon {}

	.cordIcon {
		width: 38rpx;
		height: 38rpx;
		position: relative;
		top: 4rpx;
		margin-right: 10rpx;
	}

	.skIcon {
		width: 36rpx;
		height: 36rpx;
		position: relative;
		top: 4rpx;
		margin-right: 10rpx;
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

	.transferIcon {
		width: 34rpx;
		height: 34rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
	}

	.order_info {
		margin-top: 40rpx;
		padding-bottom: 60rpx;
	}

	.sub {
		height: 8rpx;
		width: 26rpx;
		background-color: #000
	}

	.num {
		font-family: 'WeChat Sans Std';
		display: flex;
		align-items: center;
		margin-top: 40rpx;
		font-size: 56rpx;
	}

	.num_txt {
		font-variant-numeric: tabular-nums;
		font-family: -apple-system, 'SF Pro Display', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
	}

	.name {
		margin-top: 30rpx;
		font-size: 32rpx;

		text-align: center;
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

	.bc {
		display: flex;
		flex-direction: column;

	}

	.item {
		flex: 1;
		display: flex;
		font-size: 28rpx;
		margin-bottom: 20rpx;
	}

	.order_info {
		display: flex;
		flex-direction: column;
	}

	.line {
		margin-top: 88rpx;
		width: 100%;
		height: 1px;
		background-color: #eaeaea;
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

	.order_top {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.order {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background-color: #fff;
		padding: 0 60rpx;
	}

	.close {
		padding-left: 20rpx;
		position: relative;
		top: 30rpx;
		transform: scale(0.8);
	}

	.nav {
		height: 86rpx;
		background-color: #fff;
		position: relative;
	}
	.nav-title {
		position: absolute;
		left: 50%;
		bottom: 10upx;
		transform: translateX(-50%);
		font-size: 36upx;
		line-height: 1;
	}
	.allOrder{
		position: absolute;
		right: 40upx;
		font-size: 36upx;
		bottom:  10upx;
	}

	.container {
		background-color: #eaeaea;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		overflow: hidden;
	}
	
	.container.preview-mode {
		min-height: auto;
		height: 100%;
		position: relative;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.selectInfo {
		color: #5c6e96;
		margin-left: 20rpx;
	}
</style>

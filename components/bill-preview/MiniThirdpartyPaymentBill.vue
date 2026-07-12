<template>
	<view class="bill-preview bill-container">
		<!-- 导航栏 -->
		<view class="nav" :style="{ paddingTop: (previewMode ? 20 : statusBarHeight) + 'px' }">
			<uni-icons v-if="!previewMode" class="close" type="closeempty" color="#000" size="22" @click="$emit('goBack')"></uni-icons>
			<uni-icons v-else class="close" type="closeempty" color="#000" size="22"></uni-icons>
			<view v-if="isIos" class="nav-title">
				账单
			</view>
			<view class="allOrder" v-if="info.order" @click="handleMoneyClick" :style="{ fontSize: (36 * fontScale) + 'rpx' }">全部账单</view>
		</view>

		<view class="content">
			<view class="order" @click="handleMoneyClick" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="order_top">
					<view class="avatar" @click.stop="handleAvatarClick">
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

			<view class="serivce"  :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
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
			<!-- <view class="serivce"  :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="se_title" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
					联系商家
				</view>
				<view class="serivce_line">
					<view class="serivce_bx">
						<view class="se_item" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
							<view class="se_icon">
								<image class="wticon" src="/static/wxchat/phone.png" mode=""></image>
							</view>
							商家电话
						</view>
						
					</view>
				</view>
			</view> -->

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
			isIos() {
				return uni.getSystemInfoSync().platform === 'ios';
			},
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
	@import './bill-preview-common.css';

	.bill-preview .se_title {
		font-size: 28rpx;
		font-weight: normal;
	}
</style>

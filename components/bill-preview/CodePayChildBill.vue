<template>
	<view class="bill-preview bill-container">
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
	@import './bill-preview-common.css';

	.bill-preview .avatar {
		width: 94rpx;
		height: 94rpx;
		border-radius: 50px;
	}

	.bill-preview .line {
		background-color: #efefef;
		transform: scaleY(0.6);
	}

	.bill-preview .order_info {
		font-family: 'msyh';
	}

	.bill-preview .left {
		color: #9b9b9b;
	}
</style>

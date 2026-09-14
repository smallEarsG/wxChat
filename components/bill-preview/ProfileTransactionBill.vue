<template>
	<view class="profile-transaction-preview">
		<scroll-view scroll-y class="page-scroll">
			<view class="profile-header" :style="{ paddingTop: (previewMode ? 20 : statusBarHeight) + 'px' }">
				<view class="nav-row">
					<uni-icons
						class="back-icon guide-step-back"
						type="left"
						color="#111"
						size="30"
						@click="$emit('goBack')"
					></uni-icons>
				</view>

				<view class="profile-row">
					<image
						class="profile-avatar guide-step-avatar"
						:src="info.url || '/static/paySe.png'"
						mode="aspectFill"
						@click="handleAvatarClick"
					></image>
					<text class="profile-name" :style="scaledFont(36)">{{ info.name }}</text>
					<view class="message-pill">
						<view class="message-icon">
							<view class="message-dot"></view>
							<view class="message-dot"></view>
							<view class="message-dot"></view>
						</view>
						<text :style="scaledFont(28)">留言</text>
					</view>
				</view>
			</view>

			<view class="transaction-panel guide-step-content">
				<view class="tabs-row">
					<view class="tab-item muted" :style="scaledFont(32)">主页</view>
					<view class="tab-item active" :style="scaledFont(32)">
						<view class="active-badge">
							<view class="badge-check"></view>
						</view>
						<text>交易详情</text>
						<view class="active-line"></view>
					</view>
				</view>

				<view class="transaction-content" :style="horizontalPadding" @click="handleInfoClick">
					<view class="amount" :style="scaledFont(54)">{{ info.money }}</view>
					<view class="payee-name" :style="scaledFont(32)">{{ info.name }}</view>
					<view class="content-divider"></view>

					<view class="detail-list">
						<view class="detail-row" :style="scaledFont(28)">
							<view class="detail-label">当前状态</view>
							<view class="detail-value">{{ info.currentState }}</view>
						</view>
						<view class="detail-row" :style="scaledFont(28)">
							<view class="detail-label">收单机构</view>
							<view class="detail-value">{{ info.institution }}</view>
						</view>
						<view class="detail-row" :style="scaledFont(28)">
							<view class="detail-label">支付时间</view>
							<view class="detail-value">{{ info.time }}</view>
						</view>
						<view class="detail-row" :style="scaledFont(28)">
							<view class="detail-label">支付方式</view>
							<view class="detail-value">{{ info.payment }}</view>
						</view>
						<view class="detail-row" :style="scaledFont(28)">
							<view class="detail-label">交易单号</view>
							<view class="detail-value number-value">{{ info.orderNumber }}</view>
						</view>
						<view class="detail-row" :style="scaledFont(28)">
							<view class="detail-label">经营单号</view>
							<view class="detail-value number-value">{{ info.BoNumber }}</view>
						</view>
					</view>
				</view>
			</view>

			<view class="service-panel" :style="horizontalPadding">
				<view class="service-title" :style="scaledFont(30)">交易服务</view>
				<view class="service-divider"></view>
				<view class="service-grid">
					<view class="service-item" :style="scaledFont(27)">
						<image class="service-icon question-icon" src="/static/wticon.png" mode="aspectFit"></image>
						<text>对订单有疑惑</text>
					</view>
					<view class="service-item" :style="scaledFont(27)">
						<image class="service-icon" src="/static/qiw/tpicon_1.png" mode="aspectFit"></image>
						<text>发起群收款</text>
					</view>
				</view>
			</view>

			<view class="provider-footer" :style="scaledFont(24)">
				<text>本服务由财付通提供</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	name: 'ProfileTransactionBill',
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
			return (this.info.fontSize || 100) / 100
		},
		horizontalPadding() {
			const padding = this.info.padd === undefined ? 64 : this.info.padd
			return {
				paddingLeft: padding + 'rpx',
				paddingRight: padding + 'rpx'
			}
		}
	},
	methods: {
		scaledFont(size) {
			return { fontSize: (size * this.fontScale) + 'rpx' }
		},
		handleAvatarClick() {
			if (!this.previewMode) this.$emit('changeRole')
		},
		handleInfoClick() {
			if (!this.previewMode) this.$emit('editInfo')
		}
	}
}
</script>

<style scoped>
.profile-transaction-preview {
	width: 100%;
	height: 100%;
	background: #f1f1f1;
	color: #111;
	overflow: hidden;
}

.page-scroll {
	width: 100%;
	height: 100%;
}

.profile-header {
	box-sizing: border-box;
	background: #f3f3f3;
	min-height: 360rpx;
}

.nav-row {
	height: 96rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
}

.back-icon {
	padding: 12rpx;
	margin-left: -12rpx;
}

.profile-row {
	height: 224rpx;
	display: flex;
	align-items: center;
	padding: 0 34rpx;
	box-sizing: border-box;
}

.profile-avatar {
	width: 132rpx;
	height: 132rpx;
	border-radius: 50%;
	background: #ddd;
	flex-shrink: 0;
}

.profile-name {
	margin-left: 30rpx;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.message-pill {
	margin-left: auto;
	height: 70rpx;
	padding: 0 28rpx;
	border-radius: 38rpx;
	background: #fff;
	display: flex;
	align-items: center;
	gap: 12rpx;
	box-sizing: border-box;
	flex-shrink: 0;
}

.message-icon {
	width: 31rpx;
	height: 25rpx;
	border: 3rpx solid #111;
	border-radius: 14rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 3rpx;
	position: relative;
	box-sizing: border-box;
}

.message-icon::after {
	content: '';
	position: absolute;
	left: 2rpx;
	bottom: -7rpx;
	width: 8rpx;
	height: 8rpx;
	border-left: 3rpx solid #111;
	transform: skew(-28deg);
}

.message-dot {
	width: 3rpx;
	height: 3rpx;
	background: #111;
	border-radius: 50%;
}

.transaction-panel {
	background: #fff;
	border-radius: 18rpx 18rpx 0 0;
	overflow: hidden;
}

.tabs-row {
	height: 112rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 34rpx;
	box-sizing: border-box;
}

.tab-item {
	height: 100%;
	display: flex;
	align-items: center;
	position: relative;
}

.tab-item.muted {
	color: #898989;
}

.tab-item.active {
	font-weight: 600;
	gap: 12rpx;
}

.active-badge {
	width: 35rpx;
	height: 29rpx;
	background: #21c77a;
	border-radius: 50%;
	position: relative;
}

.active-badge::after {
	content: '';
	position: absolute;
	left: 2rpx;
	bottom: -5rpx;
	width: 9rpx;
	height: 9rpx;
	background: #21c77a;
	transform: rotate(25deg);
}

.badge-check {
	position: absolute;
	left: 10rpx;
	top: 7rpx;
	width: 14rpx;
	height: 7rpx;
	border-left: 3rpx solid #fff;
	border-bottom: 3rpx solid #fff;
	transform: rotate(-45deg);
	z-index: 1;
}

.active-line {
	position: absolute;
	bottom: 10rpx;
	left: 50%;
	width: 58rpx;
	height: 6rpx;
	border-radius: 6rpx;
	background: #111;
	transform: translateX(-50%);
}

.transaction-content {
	box-sizing: border-box;
	padding-top: 72rpx;
	padding-bottom: 74rpx;
}

.amount {
	font-family: 'WeChat Sans Std';
	font-weight: 500;
	text-align: center;
	line-height: 1.2;
}

.payee-name {
	text-align: center;
	margin-top: 12rpx;
}

.content-divider {
	height: 1rpx;
	background: #ededed;
	margin: 68rpx 0 50rpx;
}

.detail-row {
	display: flex;
	line-height: 1.55;
	margin-bottom: 18rpx;
}

.detail-row:last-child {
	margin-bottom: 0;
}

.detail-label {
	width: 178rpx;
	color: #858585;
	flex-shrink: 0;
}

.detail-value {
	flex: 1;
	min-width: 0;
	word-break: break-all;
}

.number-value {
	letter-spacing: 1rpx;
}

.service-panel {
	margin-top: 16rpx;
	background: #fff;
	box-sizing: border-box;
}

.service-title {
	padding: 34rpx 0 36rpx;
	font-weight: 500;
}

.service-divider {
	height: 1rpx;
	background: #ededed;
}

.service-grid {
	display: flex;
	align-items: center;
	padding: 42rpx 0 50rpx;
}

.service-item {
	width: 50%;
	display: flex;
	align-items: center;
	color: #5a6c90;
	box-sizing: border-box;
	white-space: nowrap;
}

.service-icon {
	width: 34rpx;
	height: 34rpx;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.question-icon {
	width: 36rpx;
	height: 36rpx;
}

.provider-footer {
	min-height: 230rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #b0b0b0;
	text-decoration: underline;
}
</style>

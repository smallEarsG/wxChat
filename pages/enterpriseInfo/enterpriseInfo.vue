<template>
	<view class="enterprise-info-page">
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<button class="nav-back" aria-label="返回工作台" hover-class="none" @click="goBack">
				<uni-icons type="left" size="44rpx" color="#000" />
			</button>
			<view class="nav-title">企业信息</view>
			<view class="nav-more" aria-label="更多">
				<uni-icons type="more-filled" size="44rpx" color="#000" />
			</view>
		</view>
		<view class="content">
			<view class="company-banner" :class="{ 'company-banner--compact': isCompactCompanyName }">
				<text class="company-name">{{ companyName }}</text>
			</view>

			<view class="info-group basic-info">
				<view class="info-row">
					<text class="info-label">企业简称</text>
					<view class="info-value name-value">
						<text>{{ companyName }}</text>
						<uni-icons class="name-help" type="help" size="30rpx" color="#eb6662" />
					</view>
					<uni-icons class="row-arrow" type="right" size="34rpx" color="#c7c7c7" />
				</view>
				<view class="info-row">
					<text class="info-label">创建人</text>
					<text class="info-value creator-name">{{ enterpriseInfo.creator }}</text>
				</view>
			</view>

			<view class="verification-notice">
				<uni-icons class="notice-icon" type="help" size="30rpx" color="#eb6662" />
				<text class="notice-copy">此企业信息由创建人填写，尚未认证信息真实性。<text class="verification-link"> 前往认证</text></text>
			</view>

			<view class="info-group">
				<view class="info-row">
					<text class="info-label">企业名片</text>
					<text class="info-value company-card">@{{ companyName }}</text>
					<uni-icons class="row-arrow" type="right" size="34rpx" color="#c7c7c7" />
				</view>
				<view class="info-row">
					<text class="info-label">行业类型</text>
					<text class="info-value">{{ enterpriseInfo.industry }}</text>
					<uni-icons class="row-arrow" type="right" size="34rpx" color="#c7c7c7" />
				</view>
				<view class="info-row">
					<text class="info-label">员工规模</text>
					<text class="info-value">{{ enterpriseInfo.employeeScale }}</text>
					<uni-icons class="row-arrow" type="right" size="34rpx" color="#c7c7c7" />
				</view>
			</view>

			<view class="info-group enterprise-id-group">
				<view class="info-row">
					<text class="info-label">企业ID</text>
					<text class="info-value enterprise-id">{{ enterpriseInfo.id }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			statusBarHeight: uni.getSystemInfoSync().statusBarHeight || 0,
			enterpriseInfo: {
				shortName: '小七网络服务',
				creator: '张三',
				industry: '互联网和相关服务',
				employeeScale: '1-50 人',
				id: 'wwcd7f0dceb2bd0851'
			}
		};
	},
	computed: {
		companyName() {
			const name = this.enterpriseInfo.shortName;
			return name == null ? '' : String(name).trim();
		},
		isCompactCompanyName() {
			// 按参考图拟合：六个汉字宽以内用大字，长名称用较小字号。
			const nameWidth = Array.from(this.companyName).reduce((width, character) => {
				return width + (character.codePointAt(0) <= 0x7f ? 0.5 : 1);
			}, 0);
			return nameWidth > 6;
		}
	},
	methods: {
		goBack() {
			if (getCurrentPages().length > 1) {
				uni.navigateBack({ delta: 1 });
				return;
			}
			uni.redirectTo({
				url: '/pages/WorkbenchIos/WorkbenchIos'
			});
		}
	}
};
</script>

<style scoped>
.enterprise-info-page {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background: #edf0f5;
	color: #101010;
}

.nav-bar {
	position: sticky;
	top: 0;
	z-index: 2;
	height: 104rpx;
	display: flex;
	align-items: center;
	padding-left: 12rpx;
	padding-right: 24rpx;
	background: #edf0f5;
}

.nav-back,
.nav-more {
	width: 64rpx;
	height: 104rpx;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-back {
	margin: 0;
	padding: 0;
	border: 0;
	border-radius: 0;
	background: transparent;
}

.nav-back::after {
	border: 0;
}

.nav-title {
	flex: 1;
	padding-left: 12rpx;
	text-align: center;
	font-size: 32rpx;
	font-weight: 500;
	color: #111;
}

.content {
	flex: 1;
	padding-bottom: env(safe-area-inset-bottom);
}

.company-banner {
	min-height: 144rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 32rpx 30rpx;
	box-sizing: border-box;
	background: #fff;
}

.company-name {
	display: block;
	width: 6em;
	max-width: 100%;
	font-size: 64rpx;
	line-height: 80rpx;
	font-weight: 700;
	color: #38617b;
	text-align: center;
	white-space: normal;
	word-break: break-all;
	overflow-wrap: anywhere;
}

.company-banner--compact {
	padding-top: 36rpx;
	padding-bottom: 36rpx;
}

.company-banner--compact .company-name {
	width: 8em;
	font-size: 44rpx;
	line-height: 56rpx;
}

.info-group {
	background: #fff;
}

.basic-info,
.enterprise-id-group {
	margin-top: 24rpx;
}

.info-row {
	position: relative;
	display: flex;
	align-items: center;
	min-height: 92rpx;
	padding: 18rpx 30rpx;
	box-sizing: border-box;
	font-size: 30rpx;
	line-height: 42rpx;
}

.info-row + .info-row::before {
	position: absolute;
	top: 0;
	left: 30rpx;
	right: 0;
	border-top: 1rpx solid #ededed;
	content: '';
}

.info-label {
	width: 168rpx;
	flex-shrink: 0;
}

.info-value {
	flex: 1;
	min-width: 0;
	overflow-wrap: break-word;
}

.name-value {
	word-break: break-all;
	overflow-wrap: anywhere;
}

.name-help {
	display: inline-block;
	margin-left: 10rpx;
	line-height: 1;
	vertical-align: middle;
}

.row-arrow {
	flex-shrink: 0;
	margin-left: 16rpx;
	line-height: 1;
}

.creator-name,
.verification-link {
	color: #2b85b8;
}

.verification-notice {
	display: flex;
	align-items: flex-start;
	min-height: 106rpx;
	padding: 16rpx 30rpx 20rpx;
	box-sizing: border-box;
}

.notice-icon {
	flex-shrink: 0;
	margin-top: 2rpx;
	margin-right: 10rpx;
	line-height: 34rpx;
}

.notice-copy {
	flex: 1;
	min-width: 0;
	font-size: 26rpx;
	line-height: 34rpx;
	letter-spacing: 0.5px;
	color: #999b9f;
}

.company-card {
	color: #e88f3d;
	word-break: break-all;
	overflow-wrap: anywhere;
}

.enterprise-id {
	font-size: 30rpx;
}
</style>

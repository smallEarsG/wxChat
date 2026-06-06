<template>
	<view class="page" @touchmove.stop.prevent>
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-left" @click="goBack">
				<uni-icons type="left" size="23" color="#000" />
			</view>
			<view class="nav-title">客户详情</view>
			<view class="nav-right">
				<uni-icons type="more-filled" size="22" color="#000" />
			</view>
		</view>

		<view class="content">
			<view class="profile-card ">
				<view class="profile-top">
					<view class="wechat-badge">
						<image src="/static/icon-wechat.png" mode="widthFix" style="width: 34rpx;"></image>
						<text style="color: #9f9fa0;">微信</text>
					</view>
					<image class="profile-avatar" :src="avatarUrl" mode="aspectFill" />
				</view>
				<view class="profile-name-row">
					<text class="profile-name">{{ detail.name || '微信用户' }}</text>
					<!-- <text class="gender">{{ genderText }}</text> --><image :src="this.detail.sex!='0'?'/static/chat/man.png':'/static/chat/woman.png'" mode="widthFix" style="width: 30rpx;"></image>
				</view>
			</view>

			<view class="entry-card">
				<view class="entry-item">
					<text class="entry-label">设置备注和描述</text>
					<uni-icons type="right" size="18" color="#C8C8C8" />
				</view>
				<view class="entry-item border-top">
					<text class="entry-label">设置标签</text>
					<uni-icons type="right" size="18" color="#C8C8C8" />
				</view>
			</view>

			<view class="info-card">
				<view class="info-row">
					<text class="info-key">添加时间</text>
					<text class="info-val">{{ displayAddTime }}</text>
				</view>
				<view class="line"></view>
				<view class="info-row">
					<text class="info-key">来源</text>
					<text class="info-val">{{ displaySource }}</text>
				</view>
			</view>
		</view>

		<view class="footer">
			<view class="footer_b">
				<button class="btn primary" @click="sendMessage">发消息</button>
				<button class="btn ghost" @click="startCall">语音通话</button>
			</view>
			
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			statusBarHeight: 0,
			detail: {}
		};
	},
	computed: {
		avatarUrl() {
			const avatar = this.detail.avatarUrl || this.detail.avatar || '';
			if (!avatar) return '/static/avatar-other.png';
			if (/^https?:\/\//.test(avatar)) return avatar;
			if (avatar.startsWith('/upload/')) return `http://106.15.137.235:8080${avatar}`;
			return avatar;
		},
		displayAddTime() {
			const rawTime = this.detail.addTime || this.detail.createdAt || this.formatNow();
			return this.formatTimeWithoutSeconds(rawTime);
		},
		displaySource() {
			return this.detail.soures || this.detail.source || '通过微信好友添加';
		},
		genderText() {
			const sex = Number(this.detail.sex);
			if (sex === 1) return '♂';
			if (sex === 0) return '♀';
			return '';
		}
	},
	onLoad(options) {
		this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
		if (options && options.info) {
			try {
				this.detail = JSON.parse(decodeURIComponent(options.info));
			} catch (e) {
				this.detail = {};
			}
		}
	},
	methods: {
		formatNow() {
			const d = new Date();
			const y = d.getFullYear();
			const m = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			const hh = String(d.getHours()).padStart(2, '0');
			const mm = String(d.getMinutes()).padStart(2, '0');
			return `${y}-${m}-${day} ${hh}:${mm}`;
		},
		formatTimeWithoutSeconds(timeStr) {
			if (!timeStr) return '';
			const match = timeStr.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})(:\d{2})?$/);
			if (match) {
				return match[1];
			}
			return timeStr;
		},
		goBack() {
			uni.navigateBack();
		},
		sendMessage() {
			uni.navigateBack();
		},
		startCall() {
			uni.showToast({
				title: '语音通话',
				icon: 'none'
			});
		}
	}
};
</script>

<style scoped>
.page {
	position: fixed;
	inset: 0;
	width: 100%;
	height: 100vh;
	background: #edf0f5;
	overflow: hidden;
	overscroll-behavior: none;
}

.nav-bar {
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 24rpx;
	padding-right: 24rpx;
	background: #edf0f5;
}

.nav-left,
.nav-right {
	width: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #111;
}

.content {
	padding: 20rpx;
	overflow: hidden;
	height: calc(100vh - 88rpx - env(safe-area-inset-top) - 150rpx - env(safe-area-inset-bottom));
}


.entry-card,
.info-card {
	background: #fff;
	border-radius: 20rpx;
	padding: 0 24rpx;
	margin-bottom: 20rpx;
}
.profile-card{
	background: #fff;
	border-radius: 20rpx;
	padding: 26rpx  ;
	margin-bottom: 20rpx;
}

.profile-top {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
}

.wechat-badge {
	display: flex;
	align-items: center;
	gap: 10rpx;
	font-size: 32rpx;
	font-weight: 600;
	color: #3d3d3d;
}

.wechat-dot {
	width: 18rpx;
	height: 18rpx;
	border-radius: 50%;
	background: #28c840;
}

.profile-avatar {
	width: 110rpx;
	height: 110rpx;
	border-radius: 16rpx;
	background: #f0f0f0;
}

.profile-name-row {
	margin-top: 130rpx;
	display: flex;
	align-items: center;
	gap: 6rpx;
	margin-bottom: 20;
}

.profile-name {
	font-size: 46rpx;
	font-weight: 600;
	color: #111;
}

.gender {
	font-size: 30rpx;
	color: #65a7ff;
}

.entry-item {
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.border-top {
	border-top: 1rpx solid #f1f1f1;
}

.entry-label {
	font-size: 34rpx;
	color: #141414;
	/* font-weight: 500; */
}

.info-row {
	display: flex;
	align-items: center;
	gap: 30rpx;
	min-height: 100rpx;
}

.info-key {
	min-width: 145rpx;
	font-size: 34rpx;
	color: #111;
	/* font-weight: 500; */
}

.info-val {
	font-size: 34rpx;
	color: #111;
	/* font-weight: 500; */
}

.line {
	height: 1rpx;
	background: #f1f1f1;
}

.footer {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	
	background: #f5f6f8;
	padding-bottom: env(safe-area-inset-bottom); /* 防止内容被挡，但背景照样铺到底 */
}
.footer_b{
	display: flex;
		gap: 16rpx;
		padding: 18rpx 16rpx 24rpx;
		padding-bottom: 40rpx;
}

.btn {
	flex: 1;
	height: 84rpx;
	line-height: 84rpx;
	font-size: 36rpx;
	border-radius: 14rpx;
	font-weight: 500;
}

.primary {
	background: #198cff;
	color: #fff;
}

.ghost {
	background: #fff;
	color: #111;
	border: 1rpx solid #fff;
	/* border: none !important; */
}
uni-button:after{
		border: 1rpx solid #fff;
}
</style>

<style>
page {
	height: 100%;
	overflow: hidden;
	overscroll-behavior: none;
}
</style>

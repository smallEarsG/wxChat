<template>
	<view class="enterprise-sidebar" :class="{ 'enterprise-sidebar--verified': isVerifiedCompany, 'enterprise-sidebar--with-position': !!profilePosition }" aria-label="企业切换侧边栏">
		<view class="es-content" :style="contentStyle">
			<view class="es-profile-header">
				<view class="es-profile-button" role="button" aria-label="双击编辑个人与企业资料" @click="handleEditTap('profile')">
					<image v-if="profile.avatar" class="es-avatar" :src="profile.avatar" mode="aspectFill" />
					<view v-else class="es-avatar es-avatar-fallback"><uni-icons type="person-filled" size="68rpx" color="#d9e8f8" /></view>
					<view class="es-profile-copy">
						<view class="es-name-row">
							<text class="es-profile-name">{{ profile.name }}</text>
							<uni-icons class="es-profile-arrow" type="right" size="26rpx" color="#a2b6d1" />
						</view>
						<text v-if="profilePosition" class="es-profile-position">{{ profilePosition }}</text>
						<view v-if="hasCompany" class="es-company-row" role="button" :aria-label="'企业信息：' + profile.companyName + '，双击编辑'" @click.stop="handleEditTap('company')">
							<text class="es-company-name">{{ profile.companyName }}</text>
							<image v-if="isVerifiedCompany" class="es-verified-shield" src="/static/enterprise/sidebar-verified-shield.svg" mode="aspectFit" aria-label="已认证" />
							<view v-else class="es-verification">
								<text class="es-verification-question">?</text>
								<text>{{ profile.verificationText || '未认证' }}</text>
							</view>
						</view>
					</view>
				</view>
				<view v-if="!isVerifiedCompany" class="es-profile-actions">
					<view class="es-round-button" role="button" aria-label="打开二维码" @click="handleAction('qrcode')">
						<view class="es-qrcode-icon">
							<view class="es-qrcode-corner es-qrcode-top-left" />
							<view class="es-qrcode-corner es-qrcode-top-right" />
							<view class="es-qrcode-corner es-qrcode-bottom-left" />
							<view class="es-qrcode-dots" />
						</view>
					</view>
				</view>
			</view>
			<view v-if="isVerifiedCompany" class="es-business-card" role="button" aria-label="我的名片，双击编辑" @click="handleEditTap('card')">
				<view class="es-qrcode-icon">
					<view class="es-qrcode-corner es-qrcode-top-left" />
					<view class="es-qrcode-corner es-qrcode-top-right" />
					<view class="es-qrcode-corner es-qrcode-bottom-left" />
					<view class="es-qrcode-dots" />
				</view>
				<text class="es-business-card-label">我的名片</text>
			</view>

			<view class="es-enterprise-list">
				<view v-for="enterprise in enterprises" :key="enterprise.id" class="es-enterprise-row" :class="{ 'es-enterprise-selected': isSelected(enterprise) }" role="button" :aria-label="'切换企业：' + enterprise.name + '，双击编辑，长按删除'" @pointerdown="onEnterprisePressStart" @touchstart="onEnterprisePressStart" @touchcancel="clearPendingTap" @longpress.stop="handleEnterpriseLongPress(enterprise)" @contextmenu.prevent.stop="handleEnterpriseLongPress(enterprise)" @click="handleEditTap('enterprise:' + enterprise.id, enterprise)">
					<image class="es-enterprise-icon" :src="isSelected(enterprise) ? '/static/enterprise/sidebar-company-selected.svg' : '/static/enterprise/sidebar-company-default.svg'" mode="aspectFit" />
					<text class="es-enterprise-name">{{ enterprise.name }}</text>
					<uni-icons v-if="isSelected(enterprise)" class="es-enterprise-check" type="checkmarkempty" size="42rpx" color="#f8fbff" />
					<text v-else-if="enterprise.badge" class="es-enterprise-badge">{{ enterprise.badge }}</text>
				</view>
			</view>

			<view class="es-footer">
				<view class="es-footer-row es-footer-divider" role="button" aria-label="高级功能" @click="handleAction('advanced')">
					<view class="es-footer-icon es-advanced-icon"><view /><view /></view>
					<text class="es-footer-label">高级功能</text>
				</view>
				<view class="es-footer-row" role="button" aria-label="创建或加入企业" @click="handleAction('join')">
					<image class="es-footer-icon es-join-icon" src="/static/enterprise/sidebar-create-company.svg" mode="aspectFit" />
					<text class="es-footer-label">创建/加入企业</text>
				</view>
				<view class="es-footer-row" role="button" aria-label="设置" @click="handleAction('settings')">
					<uni-icons class="es-footer-icon" type="gear" size="38rpx" color="#bdcfe6" />
					<text class="es-footer-label">设置</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'EnterpriseSidebar',
	props: {
		profile: {
			type: Object,
			default: () => ({ name: '', position: '', avatar: '', companyName: '', isVerified: false })
		},
		enterprises: { type: Array, default: () => [] },
		activeEnterpriseId: { type: String, default: '' },
		statusBarHeight: { type: Number, default: 0 }
	},
	data() {
		return { editTapTarget: '', editTapAt: null, editTapTimer: null, suppressedTapTarget: '' };
	},
	computed: {
		hasCompany() {
			return this.profile.companyName != null && !!String(this.profile.companyName).trim();
		},
		isVerifiedCompany() {
			return Boolean(this.profile.isVerified && this.hasCompany);
		},
		profilePosition() {
			return this.profile.position == null ? '' : String(this.profile.position).trim();
		},
		contentStyle() {
			const statusBarHeight = Number.isFinite(this.statusBarHeight) ? Math.max(0, this.statusBarHeight) : 0;
			return { paddingTop: statusBarHeight + 'px' };
		}
	},
	beforeDestroy() {
		this.clearPendingTap();
	},
	methods: {
		clearPendingTap() {
			if (this.editTapTimer !== null) clearTimeout(this.editTapTimer);
			this.editTapTimer = null;
			this.editTapTarget = '';
			this.editTapAt = null;
		},
		handleEditTap(target, enterprise = null) {
			if (this.suppressedTapTarget === target) return;
			const now = Date.now();
			const interval = now - this.editTapAt;
			if (this.editTapTarget === target && this.editTapAt !== null && interval >= 0 && interval <= 350) {
				this.clearPendingTap();
				if (enterprise) this.$emit('edit-enterprise', enterprise);
				else this.$emit('profile');
				return;
			}
			this.clearPendingTap();
			this.editTapTarget = target;
			this.editTapAt = now;
			if (target === 'company' || enterprise) {
				this.editTapTimer = setTimeout(() => {
					this.clearPendingTap();
					if (enterprise) this.$emit('select', enterprise);
					else this.$emit('company');
				}, 350);
			}
		},
		onEnterprisePressStart() {
			this.suppressedTapTarget = '';
			if (this.editTapTimer !== null) clearTimeout(this.editTapTimer);
			this.editTapTimer = null;
		},
		handleEnterpriseLongPress(enterprise) {
			const target = 'enterprise:' + enterprise.id;
			if (this.suppressedTapTarget === target) return;
			this.clearPendingTap();
			this.suppressedTapTarget = target;
			this.$emit('delete-enterprise', enterprise);
		},
		handleAction(action) {
			this.clearPendingTap();
			this.$emit(action);
		},
		isSelected(enterprise) {
			return String(enterprise.id) === this.activeEnterpriseId;
		}
	}
};
</script>

<style scoped>
.enterprise-sidebar {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	overflow: hidden;
	color: #f5f8fd;
	background: radial-gradient(ellipse at 100% 100%, rgba(27, 110, 132, 0.28), transparent 65%), linear-gradient(180deg, #081d48 0%, #102c5b 52%, #15396e 100%);
}
.es-content {
	display: flex;
	flex-direction: column;
	width: 88vw;
	height: 100%;
	box-sizing: border-box;
	overflow-x: hidden;
	overflow-y: auto;
}
.es-profile-header {
	display: flex;
	align-items: flex-start;
	margin-top: 132rpx;
	padding: 0 46rpx;
	flex-shrink: 0;
}
.es-profile-button {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
}
.es-avatar {
	width: 124rpx;
	height: 124rpx;
	flex-shrink: 0;
	border-radius: 15rpx;
	background: #7594b8;
}
.es-avatar-fallback {
	display: flex;
	align-items: center;
	justify-content: center;
}
.es-profile-copy {
	flex: 1;
	min-width: 0;
	margin-left: 32rpx;
}
.es-name-row {
	display: flex;
	align-items: center;
	min-width: 0;
}
.es-profile-name {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 40rpx;
	font-weight: 500;
	line-height: 56rpx;
}
.es-profile-arrow {
	flex-shrink: 0;
	margin-left: 7rpx;
}
.es-profile-position {
	display: block;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 26rpx;
	line-height: 36rpx;
	color: #aebfd6;
}
.enterprise-sidebar--with-position .es-company-row {
	margin-top: 0;
}
.enterprise-sidebar--verified .es-profile-header {
	margin-top: 160rpx;
}
.enterprise-sidebar--verified .es-profile-name {
	font-size: 36rpx;
	line-height: 48rpx;
}
.enterprise-sidebar--verified .es-company-name {
	max-width: none;
	font-size: 26rpx;
	line-height: 36rpx;
}
.es-verified-shield {
	width: 26rpx;
	height: 28rpx;
	margin-left: 10rpx;
	flex-shrink: 0;
}
.es-business-card {
	display: flex;
	align-items: center;
	flex-shrink: 0;
	min-height: 100rpx;
	margin-top: 36rpx;
	padding: 0 64rpx;
	box-sizing: border-box;
	border-top: 1rpx solid rgba(186, 208, 235, 0.06);
	border-bottom: 1rpx solid rgba(186, 208, 235, 0.06);
	cursor: pointer;
}
.es-business-card-label {
	margin-left: 52rpx;
	font-size: 30rpx;
	line-height: 44rpx;
	color: #d1dff0;
}
.enterprise-sidebar--verified .es-enterprise-list {
	margin-top: 28rpx;
}
.es-company-row {
	display: flex;
	align-items: center;
	min-width: 0;
	margin-top: 10rpx;
}
.es-company-name {
	min-width: 0;
	max-width: 110rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 25rpx;
	line-height: 34rpx;
	color: #aebfd6;
}
.es-verification {
	display: flex;
	align-items: center;
	flex-shrink: 0;
	margin-left: 10rpx;
	padding: 2rpx 7rpx;
	border-radius: 6rpx;
	font-size: 18rpx;
	line-height: 25rpx;
	white-space: nowrap;
	max-width: 130rpx;
	color: #9daec7;
	background: rgba(88, 115, 161, 0.2);
}
.es-verification text:last-child {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.es-verification-question {
	color: #e2535c;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 18rpx;
	height: 18rpx;
	margin-right: 4rpx;
	border: 1rpx solid currentColor;
	border-radius: 50%;
	font-size: 14rpx;
	line-height: 18rpx;
}
.es-profile-actions {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	margin-top: 2rpx;
	margin-left: 14rpx;
}
.es-round-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 70rpx;
	height: 70rpx;
	border-radius: 50%;
	background: rgba(175, 201, 231, 0.12);
}
.es-qrcode-icon {
	position: relative;
	width: 27rpx;
	height: 27rpx;
}
.es-qrcode-corner {
	position: absolute;
	width: 11rpx;
	height: 11rpx;
	border: 2rpx solid #afc2dc;
	box-sizing: border-box;
}
.es-qrcode-corner::after {
	position: absolute;
	inset: 2rpx;
	background: #afc2dc;
	content: '';
}
.es-qrcode-top-left {
	top: 0;
	left: 0;
}
.es-qrcode-top-right {
	top: 0;
	right: 0;
}
.es-qrcode-bottom-left {
	bottom: 0;
	left: 0;
}
.es-qrcode-dots {
	position: absolute;
	right: 1rpx;
	bottom: 1rpx;
	width: 5rpx;
	height: 5rpx;
	background: #afc2dc;
	box-shadow: -5rpx -5rpx 0 #afc2dc, 1rpx -9rpx 0 #afc2dc, -8rpx 1rpx 0 #afc2dc;
}
.es-enterprise-list {
	margin-top: 45rpx;
	flex-shrink: 0;
}
.es-enterprise-row {
	display: flex;
	align-items: center;
	min-height: 130rpx;
	padding: 0 46rpx;
	box-sizing: border-box;
}
.es-enterprise-selected {
	background: rgba(205, 225, 249, 0.09);
}
.es-enterprise-icon {
	width: 64rpx;
	height: 64rpx;
	flex-shrink: 0;
	border-radius: 14rpx;
}
.es-enterprise-name {
	flex: 1;
	min-width: 0;
	margin-left: 26rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 33rpx;
	line-height: 46rpx;
}
.es-enterprise-check,
.es-enterprise-badge {
	flex-shrink: 0;
	margin-left: 14rpx;
}
.es-enterprise-badge {
	color: #bccce2;
	font-size: 25rpx;
	line-height: 34rpx;
	padding: 0 10rpx;
	border-radius: 20rpx;
	background: rgba(166, 189, 220, 0.22);
}
.es-footer {
	flex-shrink: 0;
	margin-top: auto;
	padding: 60rpx 46rpx calc(100rpx + env(safe-area-inset-bottom));
}
.es-footer-row {
	display: flex;
	align-items: center;
	min-height: 96rpx;
	box-sizing: border-box;
}
.es-footer-divider {
	border-bottom: 1rpx solid rgba(186, 208, 235, 0.13);
}
.es-footer-icon {
	flex-shrink: 0;
}
.es-advanced-icon,
.es-join-icon {
	position: relative;
	width: 38rpx;
	height: 38rpx;
}
.es-advanced-icon view {
	position: absolute;
	top: 6rpx;
	width: 12rpx;
	height: 23rpx;
	border: 2rpx solid #bdcfe6;
	border-top-left-radius: 2rpx;
	transform: rotate(-30deg) skewY(22deg);
}
.es-advanced-icon view:first-child { left: 4rpx; }
.es-advanced-icon view:last-child { left: 20rpx; height: 17rpx; }
.es-footer-label {
	margin-left: 22rpx;
	font-size: 30rpx;
	line-height: 44rpx;
	color: #c5d3e6;
}
.es-profile-button,
.es-company-row,
.es-business-card,
.es-round-button,
.es-enterprise-row,
.es-footer-row {
	cursor: pointer;
	touch-action: manipulation;
	user-select: none;
}
</style>

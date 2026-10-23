<template>
	<view class="enterprise-page">
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<button class="nav-back" aria-label="返回工作台" hover-class="none" @click="goBack">
				<uni-icons type="left" size="44rpx" color="#000" />
			</button>
			<view class="nav-title" role="button" aria-label="编辑页面标题" @click="openEditor(['pageTitle'], '编辑页面标题')">{{ enterpriseInfo.pageTitle }}</view>
			<button class="nav-more" aria-label="编辑全部企业信息" hover-class="none" @click="openEditor()">
				<uni-icons type="more-filled" size="44rpx" color="#000" />
			</button>
		</view>

		<view class="content">
			<view class="detail-card company-summary">
				<text class="company-name" :class="{ 'company-name--compact': isCompactCompanyName }" role="button" aria-label="编辑企业名称" @click="openEditor(['shortName'], '编辑企业名称')">{{ companyName }}</text>
				<view class="verified-badge" :class="{ 'verified-badge--unverified': !enterpriseInfo.isVerified }" role="button" aria-label="编辑认证状态" @click="openEditor(['isVerified', 'verificationText'], '编辑认证状态')">
					<image v-if="enterpriseInfo.isVerified" class="verified-shield" src="/static/enterprise/verified-shield.svg" mode="aspectFit" />
					<uni-icons v-else type="info-filled" size="28rpx" color="#fff" />
					<text class="verified-label">{{ verificationText }}</text>
					<uni-icons type="right" size="24rpx" color="#fff" />
				</view>
				<text class="verification-period" role="button" aria-label="编辑认证信息" @click="openEditor(['isVerified', 'verificationText', 'verifiedUntil', 'validityPrefix', 'renewText'], '编辑认证信息')"><text v-if="enterpriseInfo.isVerified && enterpriseInfo.verifiedUntil">{{ enterpriseInfo.validityPrefix }}{{ enterpriseInfo.verifiedUntil }} </text><text class="blue-text">{{ renewText }}</text></text>
			</view>

			<view class="detail-card">
				<view v-for="field in basicFields" :key="field.key" class="detail-row" role="button" :aria-label="'编辑' + field.label" @click="openEditor([field.key, field.labelKey], '编辑' + field.label)">
					<text class="field-label">{{ field.label }}</text>
					<text class="field-value">{{ field.value }}</text>
				</view>
			</view>

			<view class="detail-card">
				<view class="detail-row" role="button" aria-label="编辑企业名片" @click="openEditor(['cardName', 'businessCardDescription', 'cardLabel'], '编辑企业名片')">
					<text class="field-label">{{ enterpriseInfo.cardLabel }}</text>
					<view class="field-value">
						<view class="business-card-name">
							<text>{{ businessCardName }}</text>
							<uni-icons class="business-card-arrow" type="right" size="30rpx" color="#e88f3d" />
						</view>
						<text class="business-card-description">{{ enterpriseInfo.businessCardDescription }}</text>
					</view>
				</view>
			</view>

			<view class="detail-card">
				<view class="detail-row" role="button" aria-label="编辑企业地址" @click="openEditor(['address', 'addressLabel'], '编辑企业地址')">
					<text class="field-label">{{ enterpriseInfo.addressLabel }}</text>
					<text class="field-value">{{ enterpriseInfo.address }}</text>
				</view>
			</view>

			<view class="detail-card">
				<view class="detail-row" role="button" aria-label="编辑企业创建人" @click="openEditor(['creator', 'creatorLabel'], '编辑企业创建人')">
					<text class="field-label">{{ enterpriseInfo.creatorLabel }}</text>
					<text class="field-value blue-text">{{ enterpriseInfo.creator }}</text>
				</view>
			</view>
		</view>
		<EnterpriseInfoEditPopup ref="enterpriseEditor" :value="enterpriseInfo" :fields="editorFields" @submit="saveEnterpriseInfo" />
	</view>
</template>

<script>
import EnterpriseInfoEditPopup from '@/components/EnterpriseInfoEditPopup/EnterpriseInfoEditPopup.vue';
import { SIDEBAR_DATA_KEY, ENTERPRISE_INFO_KEY, getActiveSidebarCompany, saveEnterpriseInfoWithCompany } from '@/utils/enterpriseCompany.js';

function createDefaultEnterpriseInfo() {
	return {
		pageTitle: '企业信息',
		shortName: '厦门条门梨信息咨询',
		fullName: '厦门条门梨信息咨询有限公司',
		entityType: '企业',
		industry: 'IT服务-其他',
		isVerified: true,
		verificationText: '',
		verifiedUntil: '2027年10月12日',
		validityPrefix: '认证有效期至',
		renewText: '',
		cardName: '',
		businessCardDescription: '完善企业名片，更正式地对外介绍企业',
		address: '厦门火炬高新区（翔安）产业区同龙二路942号413-29',
		creator: '覃博士',
		shortNameLabel: '企业简称',
		fullNameLabel: '企业全称',
		entityTypeLabel: '主体类型',
		industryLabel: '行业类型',
		cardLabel: '企业名片',
		addressLabel: '企业地址',
		creatorLabel: '企业创建人'
	};
}

const EDITOR_FIELDS = [
	{ key: 'pageTitle', label: '页面标题', group: '页面标题', required: true },
	{ key: 'shortName', label: '企业简称 / 顶部名称', group: '企业资料', required: true },
	{ key: 'fullName', label: '企业全称', group: '企业资料', type: 'textarea' },
	{ key: 'entityType', label: '主体类型', group: '企业资料' },
	{ key: 'industry', label: '行业类型', group: '企业资料' },
	{ key: 'isVerified', label: '显示为已认证', group: '认证信息', type: 'switch' },
	{ key: 'verificationText', label: '认证状态文字', group: '认证信息', placeholder: '留空时按认证状态自动显示' },
	{ key: 'verifiedUntil', label: '认证有效期', group: '认证信息', placeholder: '例如：2027年10月12日', hint: '清空后不显示有效期。' },
	{ key: 'validityPrefix', label: '有效期前的文字', group: '认证信息' },
	{ key: 'renewText', label: '认证链接文字', group: '认证信息', placeholder: '留空时按认证状态自动显示' },
	{ key: 'cardName', label: '名片名称', group: '企业名片', placeholder: '留空时跟随企业简称', hint: '留空时显示 @企业简称；填写后使用此处文字。' },
	{ key: 'businessCardDescription', label: '名片说明', group: '企业名片', type: 'textarea' },
	{ key: 'address', label: '企业地址', group: '联系信息', type: 'textarea' },
	{ key: 'creator', label: '企业创建人', group: '联系信息' },
	{ key: 'shortNameLabel', label: '企业简称标签', group: '字段名称' },
	{ key: 'fullNameLabel', label: '企业全称标签', group: '字段名称' },
	{ key: 'entityTypeLabel', label: '主体类型标签', group: '字段名称' },
	{ key: 'industryLabel', label: '行业类型标签', group: '字段名称' },
	{ key: 'cardLabel', label: '企业名片标签', group: '字段名称' },
	{ key: 'addressLabel', label: '企业地址标签', group: '字段名称' },
	{ key: 'creatorLabel', label: '企业创建人标签', group: '字段名称' }
];

export default {
	components: { EnterpriseInfoEditPopup },
	data() {
		return {
			statusBarHeight: uni.getSystemInfoSync().statusBarHeight || 0,
			enterpriseInfo: createDefaultEnterpriseInfo(),
			enterpriseInfoCompanyId: '',
			editorFields: EDITOR_FIELDS
		};
	},
	onLoad() {
		this.loadEnterpriseInfo();
	},
	onShow() {
		if (!this.$refs.enterpriseEditor || !this.$refs.enterpriseEditor.visible) this.loadEnterpriseInfo();
	},
	onBackPress() {
		if (this.$refs.enterpriseEditor && this.$refs.enterpriseEditor.visible) {
			this.$refs.enterpriseEditor.close();
			return true;
		}
		return false;
	},
	computed: {
		businessCardName() {
			return this.enterpriseInfo.cardName || '@' + this.companyName;
		},
		verificationText() {
			return this.enterpriseInfo.verificationText || (this.enterpriseInfo.isVerified ? '已认证' : '未认证');
		},
		renewText() {
			return this.enterpriseInfo.renewText || (this.enterpriseInfo.isVerified ? '重新认证' : '前往认证');
		},
		companyName() {
			const name = this.enterpriseInfo.shortName;
			return name == null ? '' : String(name).trim();
		},
		isCompactCompanyName() {
			const nameWidth = Array.from(this.companyName).reduce((width, character) => {
				return width + (character.codePointAt(0) <= 0x7f ? 0.5 : 1);
			}, 0);
			// 认证卡片的标题区更宽，参考图中的九字名称保持大字单行。
			return nameWidth > 9;
		},
		basicFields() {
			return [
				{ key: 'shortName', labelKey: 'shortNameLabel', label: this.enterpriseInfo.shortNameLabel, value: this.companyName },
				{ key: 'fullName', labelKey: 'fullNameLabel', label: this.enterpriseInfo.fullNameLabel, value: this.enterpriseInfo.fullName },
				{ key: 'entityType', labelKey: 'entityTypeLabel', label: this.enterpriseInfo.entityTypeLabel, value: this.enterpriseInfo.entityType },
				{ key: 'industry', labelKey: 'industryLabel', label: this.enterpriseInfo.industryLabel, value: this.enterpriseInfo.industry }
			];
		}
	},
	methods: {
		openEditor(keys = null, title = '编辑企业信息') {
			this.$refs.enterpriseEditor.open(keys, title);
		},
		normalizeEnterpriseInfo(source) {
			const defaults = createDefaultEnterpriseInfo();
			const values = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
			const result = {};
			Object.keys(defaults).forEach(key => {
				if (key === 'isVerified') {
					result[key] = typeof values[key] === 'boolean' ? values[key] : defaults[key];
				} else {
					result[key] = typeof values[key] === 'string' ? values[key].trim() : defaults[key];
				}
			});
			return result;
		},
		loadEnterpriseInfo() {
			try {
				const saved = uni.getStorageSync(ENTERPRISE_INFO_KEY);
				this.enterpriseInfo = this.normalizeEnterpriseInfo(saved);
				const defaults = createDefaultEnterpriseInfo();
				if (!this.enterpriseInfo.pageTitle) this.enterpriseInfo.pageTitle = defaults.pageTitle;
				if (!this.enterpriseInfo.shortName) this.enterpriseInfo.shortName = defaults.shortName;
			} catch (error) {
				this.enterpriseInfo = createDefaultEnterpriseInfo();
			}
			this.enterpriseInfoCompanyId = '';
			try {
				const active = getActiveSidebarCompany(uni.getStorageSync(SIDEBAR_DATA_KEY));
				if (active) {
					this.enterpriseInfoCompanyId = active.id;
					if (active.name.trim()) this.enterpriseInfo.shortName = active.name.trim();
				}
			} catch (error) {}
			uni.setNavigationBarTitle({ title: this.enterpriseInfo.pageTitle });
		},
		saveEnterpriseInfo(values) {
			const next = this.normalizeEnterpriseInfo(values);
			if (!next.pageTitle || !next.shortName) {
				uni.showToast({ title: '页面标题和企业简称不能为空', icon: 'none' });
				return;
			}
			try {
				saveEnterpriseInfoWithCompany(next, this.enterpriseInfoCompanyId);
			} catch (error) {
				uni.showToast({ title: '保存失败，请重试', icon: 'none' });
				return;
			}
			this.enterpriseInfo = next;
			this.$refs.enterpriseEditor.close();
			uni.setNavigationBarTitle({ title: next.pageTitle });
			uni.showToast({ title: '保存成功', icon: 'success' });
		},
		goBack() {
			if (getCurrentPages().length > 1) {
				uni.navigateBack({ delta: 1 });
				return;
			}
			uni.redirectTo({ url: '/pages/WorkbenchIos/WorkbenchIos' });
		}
	}
};
</script>

<style scoped>
.enterprise-page {
	min-height: 100vh;
	background: #edf0f5;
	color: #111;
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

.nav-back,
.nav-more {
	margin: 0;
	padding: 0;
	border: 0;
	border-radius: 0;
	background: transparent;
}

.nav-back::after,
.nav-more::after {
	border: 0;
}

.nav-title {
	flex: 1;
	min-width: 0;
	padding-left: 12rpx;
	text-align: center;
	font-size: 32rpx;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.content {
	padding: 12rpx 30rpx 48rpx;
	padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
}

.detail-card {
	padding: 44rpx 40rpx;
	border-radius: 24rpx;
	background: #fff;
}

.detail-card + .detail-card {
	margin-top: 24rpx;
}

.company-summary {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 48rpx;
	padding-bottom: 54rpx;
}

.company-name {
	display: block;
	max-width: 100%;
	font-size: 64rpx;
	line-height: 80rpx;
	font-weight: 700;
	color: #1f4f94;
	text-align: center;
	word-break: break-all;
	overflow-wrap: anywhere;
}

.company-name--compact {
	width: 8em;
	font-size: 44rpx;
	line-height: 56rpx;
}

.verified-badge {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 44rpx;
	max-width: 100%;
	box-sizing: border-box;
	margin-top: 32rpx;
	padding: 0 16rpx;
	border-radius: 24rpx;
	background: #16c447;
}

.verified-label {
	min-width: 0;
	margin-left: 6rpx;
	margin-right: 4rpx;
	font-size: 24rpx;
	line-height: 36rpx;
	color: #fff;
	word-break: break-all;
	overflow-wrap: anywhere;
}

.verified-badge--unverified {
	background: #a0a6ae;
}

.verified-shield {
	width: 28rpx;
	height: 30rpx;
	flex-shrink: 0;
}

.verification-period {
	max-width: 100%;
	margin-top: 32rpx;
	font-size: 26rpx;
	line-height: 38rpx;
	color: #777;
	text-align: center;
	overflow-wrap: anywhere;
}

.detail-row {
	display: flex;
	align-items: flex-start;
	font-size: 30rpx;
	line-height: 44rpx;
}

.detail-row + .detail-row {
	margin-top: 22rpx;
}

.field-label {
	width: 218rpx;
	flex-shrink: 0;
	color: #969696;
	word-break: break-all;
	overflow-wrap: anywhere;
}

.field-value {
	flex: 1;
	min-width: 0;
	font-size: 32rpx;
	word-break: break-all;
	overflow-wrap: anywhere;
}

.blue-text {
	color: #26599a;
}

.business-card-name {
	font-size: 30rpx;
	color: #e67d2c;
}

.business-card-arrow {
	display: inline-block;
	margin-left: 6rpx;
	line-height: 1;
	vertical-align: middle;
}

.business-card-description {
	display: block;
	margin-top: 4rpx;
	font-size: 28rpx;
	line-height: 38rpx;
	color: #777;
}
</style>

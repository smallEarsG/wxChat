<template>
	<uni-popup ref="popup" type="center" :is-mask-click="false" @change="handlePopupChange">
		<view class="sep-dialog">
			<view class="sep-header">
				<text class="sep-title">{{ dialogTitle }}</text>
				<button class="sep-close" aria-label="关闭侧栏编辑弹框" hover-class="none" @click="close"><uni-icons type="closeempty" size="42rpx" color="#666" /></button>
			</view>
			<view class="sep-body">
				<template v-if="kind === 'profile'">
					<view class="sep-field">
						<text class="sep-label">头像</text>
						<view class="sep-avatar-row">
							<image class="sep-avatar" :src="draftProfile.avatar || defaultAvatar" mode="aspectFill" aria-label="头像预览" />
							<view class="sep-avatar-actions">
								<button class="sep-image-button" :disabled="avatarBusy" aria-label="选择头像图片" @click="chooseAvatar">{{ avatarBusy ? '正在处理头像…' : '选择图片' }}</button>
								<button class="sep-reset-button" :disabled="avatarBusy" aria-label="恢复默认头像" @click="restoreAvatar">恢复默认头像</button>
							</view>
						</view>
					</view>
					<view class="sep-field">
						<text class="sep-label">姓名<text class="sep-required">*</text></text>
						<input v-model="draftProfile.name" class="sep-input" aria-label="姓名" placeholder="请输入姓名" :maxlength="-1" :cursor-spacing="24" />
					</view>
					<view class="sep-field">
						<text class="sep-label">职位</text>
						<input v-model="draftProfile.position" class="sep-input" aria-label="职位" placeholder="选填，留空不显示" :maxlength="-1" :cursor-spacing="24" />
					</view>
					<view v-if="hasActiveEnterprise" class="sep-field">
						<text class="sep-label">顶部企业名称<text class="sep-required">*</text></text>
						<input v-model="draftProfile.companyName" class="sep-input" aria-label="顶部企业名称" placeholder="请输入企业名称" :maxlength="-1" :cursor-spacing="24" />
					</view>
					<view v-if="hasActiveEnterprise" class="sep-field sep-switch-row">
						<text class="sep-label">显示为已认证</text>
						<switch :checked="draftProfile.isVerified" aria-label="显示为已认证" color="#267ef0" @change="changeVerification" />
					</view>
					<view v-if="hasActiveEnterprise && !draftProfile.isVerified" class="sep-field">
						<text class="sep-label">未认证提示文字</text>
						<input v-model="draftProfile.verificationText" class="sep-input" aria-label="认证文字" placeholder="留空时显示未认证" :maxlength="-1" :cursor-spacing="24" />
					</view>
				</template>
				<template v-else>
					<view class="sep-field">
						<text class="sep-label">企业名称<text class="sep-required">*</text></text>
						<input v-model="editingEnterprise.name" class="sep-input" aria-label="企业名称" placeholder="请输入企业名称" :maxlength="-1" :cursor-spacing="24" />
					</view>
					<view class="sep-field">
						<text class="sep-label">消息角标</text>
						<input v-model="editingEnterprise.badge" class="sep-input" aria-label="消息角标" placeholder="例如：99+，留空不显示" :maxlength="-1" :cursor-spacing="24" />
					</view>
					<view class="sep-field">
						<view class="sep-switch-row">
							<text class="sep-label">设为当前企业</text>
							<switch :checked="isEditingActive" :disabled="cannotDeselect" aria-label="设为当前企业" color="#267ef0" @change="changeActiveEnterprise" />
						</view>
						<text v-if="cannotDeselect" class="sep-hint">当前仅有一家企业。</text>
					</view>
				</template>
			</view>
			<view class="sep-footer">
				<button class="sep-action sep-cancel" aria-label="取消侧栏编辑" @click="close">取消</button>
				<button class="sep-action sep-save" :disabled="avatarBusy" aria-label="保存侧栏编辑" @click="submit">保存</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
const DEFAULT_AVATAR = '/static/enterprise/sidebar-avatar.png';

function copy(value) {
	if (Array.isArray(value)) return value.map(copy);
	if (value && typeof value === 'object') {
		return Object.keys(value).reduce((result, key) => {
			result[key] = copy(value[key]);
			return result;
		}, {});
	}
	return value;
}

function text(value) {
	return value == null ? '' : String(value);
}

function isCancelled(error) {
	return /cancel|取消/i.test(text(error && (error.errMsg || error.message)));
}

export default {
	name: 'SidebarEditPopup',
	props: {
		profile: { type: Object, required: true },
		enterprises: { type: Array, required: true },
		activeEnterpriseId: { type: String, default: '' }
	},
	data() {
		return {
			visible: false,
			avatarBusy: false,
			sessionId: 0,
			enterpriseIdSequence: 0,
			kind: 'profile',
			editingEnterpriseId: '',
			originalActiveId: '',
			draftProfile: {},
			draftEnterprises: [],
			draftActiveId: '',
			defaultAvatar: DEFAULT_AVATAR
		};
	},
	computed: {
		dialogTitle() {
			if (this.kind === 'create-enterprise') return '添加公司';
			return this.kind === 'enterprise' ? '编辑企业信息' : '编辑个人与企业资料';
		},
		editingEnterprise() {
			return this.draftEnterprises.find((item) => item.id === this.editingEnterpriseId) || {};
		},
		hasActiveEnterprise() {
			return this.draftEnterprises.some((item) => item.id === this.draftActiveId);
		},
		isEditingActive() {
			return this.hasActiveEnterprise && this.editingEnterpriseId === this.draftActiveId;
		},
		cannotDeselect() {
			return this.isEditingActive && this.draftEnterprises.length < 2;
		}
	},
	beforeDestroy() {
		this.sessionId += 1;
		this.avatarBusy = false;
		this.visible = false;
	},
	methods: {
		open(kind = 'profile', enterpriseId = '') {
			this.sessionId += 1;
			this.avatarBusy = false;
			this.kind = kind === 'create-enterprise' ? 'create-enterprise' : (kind === 'enterprise' ? 'enterprise' : 'profile');
			const profile = copy(this.profile || {});
			profile.name = text(profile.name);
			profile.position = text(profile.position);
			profile.companyName = text(profile.companyName);
			profile.avatar = text(profile.avatar) || DEFAULT_AVATAR;
			profile.isVerified = Boolean(profile.isVerified);
			profile.verificationText = text(profile.verificationText);
			this.draftProfile = profile;
			this.draftEnterprises = copy(this.enterprises || []).map((item) => ({
				...item,
				id: text(item.id),
				name: text(item.name),
				badge: text(item.badge)
			}));
			if (!this.draftEnterprises.length && this.kind === 'enterprise') {
				this.draftEnterprises = [{ id: 'local-enterprise', name: profile.companyName || '我的企业', badge: '' }];
			}
			this.draftActiveId = this.draftEnterprises.some((item) => item.id === this.activeEnterpriseId) ? this.activeEnterpriseId : (this.draftEnterprises[0] ? this.draftEnterprises[0].id : '');
			this.originalActiveId = this.draftActiveId;
			if (this.kind === 'create-enterprise') {
				const id = this.createEnterpriseId();
				this.draftEnterprises.push({ id, name: '', badge: '' });
				this.editingEnterpriseId = id;
				if (!this.draftActiveId) this.draftActiveId = id;
			} else {
				this.editingEnterpriseId = this.draftEnterprises.some((item) => item.id === enterpriseId) ? enterpriseId : this.draftActiveId;
			}
			this.visible = true;
			this.$refs.popup.open('center');
		},
		createEnterpriseId() {
			let id;
			do {
				this.enterpriseIdSequence += 1;
				id = 'enterprise-' + Date.now().toString(36) + '-' + this.enterpriseIdSequence.toString(36);
			} while (this.draftEnterprises.some((item) => item.id === id));
			return id;
		},
		close() {
			this.sessionId += 1;
			this.avatarBusy = false;
			this.visible = false;
			this.$refs.popup.close();
		},
		handlePopupChange(event) {
			const show = Boolean(event && event.show);
			if (!show && this.visible) {
				this.sessionId += 1;
				this.avatarBusy = false;
			}
			this.visible = show;
		},
		isCurrentSession(session) {
			return this.visible && this.sessionId === session;
		},
		changeVerification(event) {
			this.draftProfile.isVerified = Boolean(event && event.detail && event.detail.value);
		},
		changeActiveEnterprise(event) {
			const selected = Boolean(event && event.detail && event.detail.value);
			if (selected) {
				this.draftActiveId = this.editingEnterpriseId;
			} else if (this.isEditingActive && !this.cannotDeselect) {
				this.draftActiveId = this.draftEnterprises.find((item) => item.id !== this.editingEnterpriseId).id;
			}
		},
		restoreAvatar() {
			if (!this.avatarBusy) this.draftProfile.avatar = DEFAULT_AVATAR;
		},
		chooseAvatar() {
			if (this.avatarBusy) return;
			const session = this.sessionId;
			this.avatarBusy = true;
			try {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: async (result) => {
						if (!this.isCurrentSession(session)) return;
						try {
							const selection = result || {};
							const file = selection.tempFiles && selection.tempFiles[0];
							const path = (selection.tempFilePaths && selection.tempFilePaths[0]) || (file && file.path) || '';
							if (!file && !path) return;
							let avatar = '';
							// #ifdef H5
							avatar = await this.persistH5Avatar(file, path);
							// #endif
							// #ifndef H5
							avatar = await this.persistNativeAvatar(path);
							// #endif
							if (this.isCurrentSession(session)) this.draftProfile.avatar = avatar;
						} catch (error) {
							if (this.isCurrentSession(session) && !isCancelled(error)) uni.showToast({ title: '头像处理失败，请重试', icon: 'none' });
						} finally {
							if (this.isCurrentSession(session)) this.avatarBusy = false;
						}
					},
					fail: (error) => {
						if (!this.isCurrentSession(session)) return;
						this.avatarBusy = false;
						if (!isCancelled(error)) uni.showToast({ title: '选择头像失败，请重试', icon: 'none' });
					}
				});
			} catch (error) {
				if (this.isCurrentSession(session)) {
					this.avatarBusy = false;
					if (!isCancelled(error)) uni.showToast({ title: '选择头像失败，请重试', icon: 'none' });
				}
			}
		},
		async persistH5Avatar(file, path) {
			let blob = null;
			if (typeof Blob !== 'undefined') {
				if (file && file.file instanceof Blob) blob = file.file;
				else if (file instanceof Blob) blob = file;
			}
			if (!blob && /^data:image\//i.test(path)) return this.compressAvatar(path);
			if (!blob && /^blob:/i.test(path)) {
				const response = await fetch(path);
				if (!response.ok) throw new Error('读取图片失败');
				blob = await response.blob();
			}
			if (!blob) throw new Error('未能读取所选图片');
			const dataUrl = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(text(reader.result));
				reader.onerror = () => reject(new Error('读取图片失败'));
				reader.onabort = () => reject(new Error('cancel'));
				reader.readAsDataURL(blob);
			});
			return this.compressAvatar(dataUrl);
		},
		compressAvatar(dataUrl) {
			if (typeof document === 'undefined' || typeof Image === 'undefined') return Promise.resolve(dataUrl);
			return new Promise((resolve, reject) => {
				const image = new Image();
				image.onload = () => {
					try {
						const canvas = document.createElement('canvas');
						canvas.width = 256;
						canvas.height = 256;
						const context = canvas.getContext('2d');
						if (!context || !image.width || !image.height) throw new Error('处理图片失败');
						const side = Math.min(image.width, image.height);
						context.fillStyle = '#fff';
						context.fillRect(0, 0, 256, 256);
						context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 256, 256);
						resolve(canvas.toDataURL('image/jpeg', 0.88));
					} catch (error) {
						reject(error);
					}
				};
				image.onerror = () => reject(new Error('图片无法打开'));
				image.src = dataUrl;
			});
		},
		persistNativeAvatar(path) {
			return new Promise((resolve, reject) => {
				if (!path) return reject(new Error('未能读取所选图片'));
				uni.saveFile({
					tempFilePath: path,
					success: (result) => result.savedFilePath ? resolve(result.savedFilePath) : reject(new Error('保存头像失败')),
					fail: reject
				});
			});
		},
		submit() {
			if (this.avatarBusy) return;
			const profile = copy(this.draftProfile);
			const enterprises = copy(this.draftEnterprises);
			const activeEnterpriseId = enterprises.some((item) => item.id === this.draftActiveId) ? this.draftActiveId : (enterprises[0] ? enterprises[0].id : '');
			const active = enterprises.find((item) => item.id === activeEnterpriseId);
			if (this.kind === 'profile') {
				profile.name = text(profile.name).trim();
				profile.position = text(profile.position).trim();
				profile.companyName = text(profile.companyName).trim();
				if (!profile.name || (active && !profile.companyName)) {
					uni.showToast({ title: !profile.name ? '请填写姓名' : '请填写企业名称', icon: 'none' });
					return;
				}
				if (active) {
					profile.verificationText = text(profile.verificationText).trim();
					active.name = profile.companyName;
				}
			} else {
				const edited = enterprises.find((item) => item.id === this.editingEnterpriseId);
				edited.name = text(edited.name).trim();
				edited.badge = text(edited.badge).trim();
				if (!edited.name) {
					uni.showToast({ title: '请填写企业名称', icon: 'none' });
					return;
				}
				if (edited.id === activeEnterpriseId || activeEnterpriseId !== this.originalActiveId) profile.companyName = active.name;
			}
			this.$emit('submit', { profile, enterprises, activeEnterpriseId });
		}
	}
};
</script>

<style scoped>
.sep-dialog {
	width: 680rpx;
	max-width: 90vw;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	border-radius: 24rpx;
	overflow: hidden;
	background: #fff;
}
.sep-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-shrink: 0;
	padding: 20rpx 24rpx 20rpx 32rpx;
	border-bottom: 1rpx solid #eee;
}
.sep-title { flex: 1; min-width: 0; font-size: 32rpx; font-weight: 600; color: #222; }
.sep-close { width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin: 0 0 0 12rpx; padding: 0; border: 0; background: transparent; line-height: 1; }
.sep-close::after, .sep-action::after, .sep-image-button::after, .sep-reset-button::after { border: 0; }
.sep-body { flex: 1; min-height: 0; padding: 28rpx 32rpx 4rpx; overflow-y: auto; }
.sep-field { margin-bottom: 26rpx; }
.sep-label { display: block; margin-bottom: 12rpx; font-size: 28rpx; line-height: 40rpx; color: #333; }
.sep-required { margin-left: 6rpx; color: #e34d59; }
.sep-input { width: 100%; height: 80rpx; padding: 18rpx 20rpx; box-sizing: border-box; border: 1rpx solid #dedede; border-radius: 12rpx; background: #fafafa; font-size: 28rpx; line-height: 40rpx; color: #222; }
.sep-switch-row { display: flex; align-items: center; justify-content: space-between; }
.sep-switch-row .sep-label { margin-bottom: 0; }
.sep-hint { display: block; margin-top: 8rpx; font-size: 24rpx; line-height: 34rpx; color: #999; }
.sep-avatar-row { display: flex; align-items: center; }
.sep-avatar { width: 124rpx; height: 124rpx; flex-shrink: 0; margin-right: 28rpx; border-radius: 16rpx; background: #edf0f5; }
.sep-avatar-actions { flex: 1; min-width: 0; }
.sep-image-button, .sep-reset-button { margin: 0; padding: 0 16rpx; border: 0; border-radius: 10rpx; font-size: 26rpx; line-height: 60rpx; }
.sep-image-button { background: #edf4ff; color: #267ef0; }
.sep-reset-button { margin-top: 8rpx; background: transparent; color: #777; }
.sep-footer { display: flex; flex-shrink: 0; padding: 24rpx 32rpx; border-top: 1rpx solid #eee; background: #fff; }
.sep-action { flex: 1; height: 80rpx; padding: 0; border: 0; border-radius: 12rpx; font-size: 30rpx; line-height: 80rpx; }
.sep-cancel { margin: 0 20rpx 0 0; background: #f0f1f3; color: #555; }
.sep-save { margin: 0; background: #267ef0; color: #fff; }
.sep-save[disabled] { background: #b5cef3; color: #fff; }
</style>

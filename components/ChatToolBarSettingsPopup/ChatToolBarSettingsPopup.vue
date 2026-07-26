<template>
	<uni-popup ref="popup" type="center">
		<view class="toolbar-settings-popup">
			<view class="popup-header">快捷栏设置</view>
			<view class="popup-body">
				<view class="popup-row">
					<text class="popup-label">快捷栏显示</text>
					<switch :checked="draft.visible" color="#007aff" @change="onVisibleChange" />
				</view>

				<view class="item-list">
					<view
						v-for="(item, index) in draft.items"
						:key="item.id"
						class="item-row"
					>
						<image :src="item.icon" class="item-icon" mode="aspectFill" />
						<text class="item-label">{{ item.label }}</text>
						<view class="item-actions">
							<button
								class="action-btn"
								size="mini"
								:disabled="index === 0"
								@click="moveUp(index)"
							>上移</button>
							<button
								class="action-btn"
								size="mini"
								:disabled="index === draft.items.length - 1"
								@click="moveDown(index)"
							>下移</button>
							<button
								v-if="item.custom"
								class="action-btn danger"
								size="mini"
								@click="removeItem(index)"
							>删除</button>
						</view>
					</view>
				</view>

				<view class="add-section">
					<button
						v-if="!showAddForm"
						class="add-toggle-btn"
						type="default"
						plain="true"
						@click="showAddForm = true"
					>新增元素</button>

					<view v-else class="add-form">
						<view class="popup-row column">
							<text class="popup-label">元素名称</text>
							<input
								class="popup-input"
								v-model="newItem.label"
								placeholder="请输入元素名称"
							/>
						</view>
						<view class="popup-row column">
							<text class="popup-label">元素图标</text>
							<view class="upload-area" @click="chooseIcon">
								<image
									v-if="newItem.icon"
									:src="newItem.icon"
									class="upload-preview"
									mode="aspectFill"
								/>
								<view v-else class="upload-placeholder">
									<text class="upload-text">点击上传图标</text>
								</view>
							</view>
						</view>
						<view class="add-form-actions">
							<button class="form-btn ghost" size="mini" @click="cancelAddForm">取消</button>
							<button class="form-btn primary" size="mini" @click="addItem">添加</button>
						</view>
					</view>
				</view>
			</view>

			<view class="popup-actions">
				<button class="popup-btn cancel" @click="close">取消</button>
				<button class="popup-btn confirm" :loading="saving" @click="confirm">确定</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
import { uploadImage } from '@/api/conversations.js';

function cloneConfig(config) {
	return {
		visible: !!config.visible,
		items: (config.items || []).map((item) => ({
			id: item.id,
			label: item.label,
			icon: item.icon,
			custom: !!item.custom
		}))
	};
}

function isTempFilePath(path) {
	if (!path || typeof path !== 'string') return false;
	if (path.startsWith('data:')) return false;
	return !path.startsWith('/static/') && !path.startsWith('http://') && !path.startsWith('https://');
}

export default {
	name: 'ChatToolBarSettingsPopup',
	data() {
		return {
			draft: {
				visible: true,
				items: []
			},
			conversationId: '',
			showAddForm: false,
			newItem: {
				label: '',
				icon: ''
			},
			saving: false
		};
	},
	methods: {
		open(config, conversationId = '') {
			this.draft = cloneConfig(config);
			this.conversationId = conversationId || '';
			this.resetAddForm();
			this.$refs.popup.open();
		},
		close() {
			this.$refs.popup.close();
			this.resetAddForm();
		},
		resetAddForm() {
			this.showAddForm = false;
			this.newItem = {
				label: '',
				icon: ''
			};
		},
		onVisibleChange(event) {
			this.draft.visible = !!event.detail.value;
		},
		moveUp(index) {
			if (index <= 0) return;
			const items = this.draft.items.slice();
			const temp = items[index - 1];
			items[index - 1] = items[index];
			items[index] = temp;
			this.draft.items = items;
		},
		moveDown(index) {
			if (index >= this.draft.items.length - 1) return;
			const items = this.draft.items.slice();
			const temp = items[index + 1];
			items[index + 1] = items[index];
			items[index] = temp;
			this.draft.items = items;
		},
		removeItem(index) {
			const item = this.draft.items[index];
			if (!item || !item.custom) return;
			this.draft.items.splice(index, 1);
		},
		chooseIcon() {
			uni.chooseImage({
				count: 1,
				success: (res) => {
					if (res.tempFilePaths && res.tempFilePaths[0]) {
						this.newItem.icon = res.tempFilePaths[0];
					}
				},
				fail: () => {
					uni.showToast({
						title: '选择图标失败',
						icon: 'none'
					});
				}
			});
		},
		cancelAddForm() {
			this.resetAddForm();
		},
		addItem() {
			const label = (this.newItem.label || '').trim();
			if (!label) {
				uni.showToast({
					title: '请输入元素名称',
					icon: 'none'
				});
				return;
			}
			if (!this.newItem.icon) {
				uni.showToast({
					title: '请上传元素图标',
					icon: 'none'
				});
				return;
			}

			this.draft.items.push({
				id: `custom_${Date.now()}`,
				label,
				icon: this.newItem.icon,
				custom: true
			});
			this.resetAddForm();
		},
		async persistCustomIcons(items) {
			const nextItems = [];
			const needUpload = items.some((item) => item.custom && isTempFilePath(item.icon));

			if (needUpload) {
				if (!this.conversationId) {
					throw new Error('missing_conversation_id');
				}
				uni.showLoading({
					title: '上传中...',
					mask: true
				});
			}

			try {
				for (const item of items) {
					if (item.custom && isTempFilePath(item.icon)) {
						const res = await uploadImage(item.icon, this.conversationId);
						if (!res || !res.data) {
							throw new Error('upload_response_empty');
						}
						nextItems.push({
							...item,
							icon: res.data
						});
					} else {
						nextItems.push({ ...item });
					}
				}
				return nextItems;
			} finally {
				if (needUpload) {
					uni.hideLoading();
				}
			}
		},
		async confirm() {
			if (!this.draft.items.length) {
				uni.showToast({
					title: '至少保留一个快捷栏元素',
					icon: 'none'
				});
				return;
			}

			this.saving = true;
			try {
				const items = await this.persistCustomIcons(this.draft.items);
				const payload = cloneConfig({
					visible: this.draft.visible,
					items
				});
				this.$emit('save', payload);
				this.close();
			} catch (error) {
				const message = error && error.message === 'missing_conversation_id'
					? '缺少会话信息，无法上传图标'
					: '上传图标失败，请重试';
				uni.showToast({
					title: message,
					icon: 'none'
				});
			} finally {
				this.saving = false;
			}
		}
	}
};
</script>

<style scoped>
.toolbar-settings-popup {
	width: 640rpx;
	max-height: 80vh;
	background-color: #fff;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.15);
	display: flex;
	flex-direction: column;
}

.popup-header {
	padding: 32rpx 36rpx;
	font-size: 32rpx;
	font-weight: 600;
	color: #111827;
	border-bottom: 1rpx solid #f0f0f0;
}

.popup-body {
	padding: 30rpx 36rpx;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	overflow-y: auto;
}

.popup-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24rpx;
}

.popup-row.column {
	flex-direction: column;
	align-items: flex-start;
}

.popup-label {
	font-size: 28rpx;
	color: #374151;
}

.popup-input {
	width: 100%;
	height: 70rpx;
	padding: 0 20rpx;
	border: 1rpx solid #e5e7eb;
	border-radius: 12rpx;
	font-size: 28rpx;
	box-sizing: border-box;
}

.item-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.item-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 16rpx;
	border: 1rpx solid #e5e7eb;
	border-radius: 16rpx;
	background-color: #fafafa;
}

.item-icon {
	width: 48rpx;
	height: 48rpx;
	border-radius: 8rpx;
	flex-shrink: 0;
}

.item-label {
	flex: 1;
	font-size: 28rpx;
	color: #111827;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.item-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
	justify-content: flex-end;
}

.action-btn {
	margin: 0;
	padding: 0 16rpx;
	line-height: 52rpx;
	font-size: 22rpx;
}

.action-btn.danger {
	color: #ef4444;
}

.add-section {
	margin-top: 8rpx;
}

.add-toggle-btn {
	width: 100%;
}

.add-form {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	padding: 20rpx;
	border: 1rpx dashed #d1d5db;
	border-radius: 16rpx;
	background-color: #f9fafb;
}

.upload-area {
	width: 120rpx;
	height: 120rpx;
	border: 1rpx dashed #cbd5e1;
	border-radius: 16rpx;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #fff;
}

.upload-preview {
	width: 100%;
	height: 100%;
}

.upload-placeholder {
	padding: 12rpx;
	text-align: center;
}

.upload-text {
	font-size: 22rpx;
	color: #6b7280;
}

.add-form-actions {
	display: flex;
	justify-content: flex-end;
	gap: 12rpx;
}

.form-btn {
	margin: 0;
}

.form-btn.primary {
	color: #007aff;
}

.popup-actions {
	display: flex;
	justify-content: flex-end;
	gap: 20rpx;
	padding: 24rpx 36rpx;
	border-top: 1rpx solid #f0f0f0;
}

.popup-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 16rpx;
	font-size: 28rpx;
}

.popup-btn.cancel {
	color: #666;
	background-color: #f5f5f5;
}

.popup-btn.confirm {
	color: #fff;
	background-color: #007aff;
}
</style>

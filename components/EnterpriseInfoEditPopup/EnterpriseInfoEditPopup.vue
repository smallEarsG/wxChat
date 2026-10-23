<template>
	<uni-popup ref="popup" type="center" :is-mask-click="false" @change="handlePopupChange">
		<view class="enterprise-editor">
			<view class="editor-header">
				<text class="editor-title">{{ dialogTitle }}</text>
				<button class="editor-close" aria-label="关闭编辑弹框" hover-class="none" @click="close">
					<uni-icons type="closeempty" size="42rpx" color="#666" />
				</button>
			</view>

			<view class="editor-body">
				<view v-for="group in fieldGroups" :key="group.name" class="field-group">
					<text v-if="group.name" class="group-title">{{ group.name }}</text>
					<view v-for="field in group.fields" :key="field.key" class="editor-field">
						<view class="field-heading" :class="{ 'field-heading--switch': field.type === 'switch' }">
							<view class="field-label">
								<text>{{ field.label }}</text>
								<text v-if="field.required && field.type !== 'switch'" class="required-mark">*</text>
							</view>
							<switch v-if="field.type === 'switch'" :checked="draft[field.key]" :aria-label="field.label" color="#267ef0" @change="handleSwitchChange(field.key, $event)" />
						</view>
						<textarea v-if="field.type === 'textarea'" v-model="draft[field.key]" class="field-input field-textarea" :class="{ 'field-input--error': validationErrors[field.key] }" :aria-label="field.label" :placeholder="field.placeholder || ('请输入' + field.label)" :maxlength="-1" :auto-height="false" :show-confirm-bar="false" :cursor-spacing="24" @input="clearError(field.key)" />
						<input v-else-if="field.type !== 'switch'" v-model="draft[field.key]" class="field-input" :class="{ 'field-input--error': validationErrors[field.key] }" :aria-label="field.label" :placeholder="field.placeholder || ('请输入' + field.label)" :maxlength="-1" :cursor-spacing="24" type="text" @input="clearError(field.key)" />
						<text v-if="field.hint" class="field-hint">{{ field.hint }}</text>
						<text v-if="validationErrors[field.key]" class="field-error">{{ validationErrors[field.key] }}</text>
					</view>
				</view>
			</view>

			<view class="editor-footer">
				<button class="editor-action editor-cancel" @click="close">取消</button>
				<button class="editor-action editor-save" @click="submit">保存</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
function copyDraft(value) {
	if (Array.isArray(value)) return value.map(copyDraft);
	if (value && typeof value === 'object') {
		return Object.keys(value).reduce((copy, key) => {
			copy[key] = copyDraft(value[key]);
			return copy;
		}, {});
	}
	return value;
}

export default {
	name: 'EnterpriseInfoEditPopup',
	props: {
		value: { type: Object, required: true },
		fields: { type: Array, required: true }
	},
	data() {
		return {
			visible: false,
			draft: {},
			activeKeys: null,
			dialogTitle: '编辑企业信息',
			validationErrors: {}
		};
	},
	computed: {
		visibleFields() {
			return this.fields.filter((field) => this.activeKeys === null || this.activeKeys.indexOf(field.key) !== -1);
		},
		fieldGroups() {
			return this.visibleFields.reduce((groups, field) => {
				const name = field.group || '';
				let group = groups.find((item) => item.name === name);
				if (!group) {
					group = { name, fields: [] };
					groups.push(group);
				}
				group.fields.push(field);
				return groups;
			}, []);
		}
	},
	methods: {
		open(keys = null, title = '编辑企业信息') {
			const draft = copyDraft(this.value);
			this.fields.forEach((field) => {
				const value = draft[field.key];
				draft[field.key] = field.type === 'switch' ? Boolean(value) : (value == null ? '' : String(value));
			});
			this.draft = draft;
			this.activeKeys = Array.isArray(keys) ? keys.slice() : null;
			this.dialogTitle = title || '编辑企业信息';
			this.validationErrors = {};
			this.visible = true;
			this.$refs.popup.open('center');
		},
		close() {
			this.visible = false;
			this.$refs.popup.close();
		},
		handlePopupChange(event) {
			this.visible = Boolean(event && event.show);
		},
		handleSwitchChange(key, event) {
			const value = event && event.detail ? event.detail.value : false;
			this.draft[key] = Boolean(value);
		},
		clearError(key) {
			if (!this.validationErrors[key]) return;
			const nextErrors = { ...this.validationErrors };
			delete nextErrors[key];
			this.validationErrors = nextErrors;
		},
		submit() {
			const errors = {};
			this.visibleFields.forEach((field) => {
				if (field.required && field.type !== 'switch' && !String(this.draft[field.key] == null ? '' : this.draft[field.key]).trim()) {
					errors[field.key] = field.label + '不能为空';
				}
			});
			this.validationErrors = errors;
			const firstError = Object.keys(errors)[0];
			if (firstError) {
				uni.showToast({ title: errors[firstError], icon: 'none' });
				return;
			}
			// 父页面保存成功后关闭，保存失败时保留当前草稿。
			this.$emit('submit', { ...this.draft });
		}
	}
};
</script>

<style scoped>
.enterprise-editor {
	width: 680rpx;
	max-width: 90vw;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	background: #fff;
	border-radius: 24rpx;
	overflow: hidden;
}

.editor-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-shrink: 0;
	padding: 20rpx 24rpx 20rpx 32rpx;
	border-bottom: 1rpx solid #eee;
}

.editor-title {
	flex: 1;
	min-width: 0;
	font-size: 32rpx;
	font-weight: 600;
	color: #222;
}

.editor-close {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin: 0 0 0 12rpx;
	padding: 0;
	background: transparent;
	border: 0;
	line-height: 1;
}

.editor-close::after,
.editor-action::after {
	border: 0;
}

.editor-body {
	flex: 1;
	min-height: 0;
	padding: 28rpx 32rpx 8rpx;
	overflow-y: auto;
}

.field-group + .field-group {
	margin-top: 32rpx;
}

.group-title {
	display: block;
	margin-bottom: 24rpx;
	font-size: 26rpx;
	font-weight: 600;
	color: #267ef0;
}

.editor-field {
	margin-bottom: 26rpx;
}

.field-heading {
	margin-bottom: 12rpx;
}

.field-heading--switch {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 0;
}

.field-label {
	font-size: 28rpx;
	line-height: 40rpx;
	color: #333;
}

.required-mark {
	margin-left: 6rpx;
	color: #e34d59;
}

.field-input {
	width: 100%;
	height: 80rpx;
	padding: 18rpx 20rpx;
	box-sizing: border-box;
	border: 1rpx solid #dedede;
	border-radius: 12rpx;
	background: #fafafa;
	font-size: 28rpx;
	line-height: 40rpx;
	color: #222;
}

.field-textarea {
	height: 168rpx;
}

.field-input--error {
	border-color: #e34d59;
}

.field-hint,
.field-error {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	line-height: 34rpx;
	color: #999;
}

.field-error {
	color: #e34d59;
}

.editor-footer {
	display: flex;
	flex-shrink: 0;
	padding: 24rpx 32rpx;
	border-top: 1rpx solid #eee;
	background: #fff;
}

.editor-action {
	flex: 1;
	height: 80rpx;
	padding: 0;
	border: 0;
	border-radius: 12rpx;
	font-size: 30rpx;
	line-height: 80rpx;
}

.editor-cancel {
	margin: 0 20rpx 0 0;
	background: #f0f1f3;
	color: #555;
}

.editor-save {
	margin: 0;
	background: #267ef0;
	color: #fff;
}
</style>

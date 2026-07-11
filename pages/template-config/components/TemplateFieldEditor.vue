<template>
	<view v-if="visible" class="modal-mask" @click="$emit('close')">
		<view class="modal-panel" @click.stop>
			<view class="modal-header">
				<text class="modal-title">编辑字段</text>
				<view class="close-btn" @click="$emit('close')">
					<uni-icons type="closeempty" size="22" color="#666" />
				</view>
			</view>

			<view class="form-body">
				<view class="form-item">
					<text class="form-label">字段名称</text>
					<input
						class="input-field"
						:value="label"
						placeholder="请输入字段名称"
						@input="$emit('update:label', $event.detail.value)"
					/>
				</view>
				<view class="form-item">
					<text class="form-label">系统字段</text>
					<text class="form-readonly">{{ fieldKey }}</text>
				</view>
			</view>

			<view class="modal-footer">
				<button class="footer-btn secondary" @click="$emit('close')">取消</button>
				<button class="footer-btn primary" @click="$emit('confirm')">确定</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TemplateFieldEditor',
	props: {
		visible: { type: Boolean, default: false },
		label: { type: String, default: '' },
		fieldKey: { type: String, default: '' }
	}
}
</script>

<style scoped>
.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.45);
	z-index: 1000;
	display: flex;
	align-items: flex-end;
}

.modal-panel {
	width: 100%;
	background: #fff;
	border-radius: 32rpx 32rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	border-bottom: 2rpx solid #f0f2f5;
}

.modal-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1a1a1a;
}

.close-btn {
	padding: 8rpx;
}

.form-body {
	padding: 32rpx;
}

.form-item {
	margin-bottom: 32rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	color: #666;
	margin-bottom: 16rpx;
}

.input-field {
	width: 100%;
	height: 88rpx;
	background: #f5f6f7;
	border-radius: 16rpx;
	padding: 0 28rpx;
	font-size: 30rpx;
	box-sizing: border-box;
	border: 2rpx solid #e8eaed;
}

.form-readonly {
	font-size: 28rpx;
	color: #999;
	padding: 16rpx 20rpx;
	background: #f5f6f7;
	border-radius: 12rpx;
}

.modal-footer {
	display: flex;
	gap: 24rpx;
	padding: 24rpx 32rpx;
	border-top: 2rpx solid #f0f2f5;
}

.footer-btn {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	font-size: 30rpx;
	border-radius: 44rpx;
	border: none;
}

.footer-btn.secondary {
	background: #f0f2f5;
	color: #666;
}

.footer-btn.primary {
	background: #4A90E2;
	color: #fff;
}
</style>

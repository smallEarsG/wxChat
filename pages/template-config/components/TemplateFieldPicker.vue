<template>
	<view v-if="visible" class="modal-mask" @click="$emit('close')">
		<view class="modal-panel" @click.stop>
			<view class="modal-header">
				<text class="modal-title">添加订单字段</text>
				<view class="close-btn" @click="$emit('close')">
					<uni-icons type="closeempty" size="22" color="#666" />
				</view>
			</view>

			<view class="search-box">
				<uni-icons type="search" size="18" color="#999" />
				<input
					class="search-input"
					:value="keyword"
					placeholder="搜索字段名称"
					@input="$emit('update:keyword', $event.detail.value)"
				/>
			</view>

			<scroll-view class="picker-list" scroll-y>
				<view v-if="filteredFields.length === 0" class="empty-tip">没有可添加的字段</view>
				<view
					v-for="field in filteredFields"
					:key="field.key"
					class="picker-item"
					@click="toggleSelect(field.key)"
				>
					<checkbox :checked="selectedKeys.includes(field.key)" color="#4A90E2" />
					<text class="picker-label">{{ field.label }}</text>
				</view>
			</scroll-view>

			<view class="modal-footer">
				<button class="footer-btn secondary" @click="$emit('close')">取消</button>
				<button class="footer-btn primary" :disabled="selectedKeys.length === 0" @click="$emit('confirm')">
					添加所选字段{{ selectedKeys.length > 0 ? `(${selectedKeys.length})` : '' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TemplateFieldPicker',
	props: {
		visible: { type: Boolean, default: false },
		keyword: { type: String, default: '' },
		filteredFields: { type: Array, default: () => [] },
		selectedKeys: { type: Array, default: () => [] }
	},
	methods: {
		toggleSelect(key) {
			this.$emit('toggle-select', key)
		}
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
	max-height: 80vh;
	background: #fff;
	border-radius: 32rpx 32rpx 0 0;
	display: flex;
	flex-direction: column;
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

.search-box {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin: 24rpx 32rpx;
	padding: 0 24rpx;
	height: 72rpx;
	background: #f5f6f7;
	border-radius: 36rpx;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
}

.picker-list {
	flex: 1;
	max-height: 50vh;
	padding: 0 32rpx;
}

.picker-item {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 28rpx 0;
	border-bottom: 2rpx solid #f5f6f7;
}

.picker-label {
	font-size: 30rpx;
	color: #333;
}

.empty-tip {
	text-align: center;
	color: #999;
	font-size: 28rpx;
	padding: 60rpx 0;
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

.footer-btn.primary[disabled] {
	opacity: 0.5;
}
</style>

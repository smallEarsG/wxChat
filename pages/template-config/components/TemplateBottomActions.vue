<template>
	<view class="bottom-actions">
		<view class="status-text" v-if="saveStatusText">{{ saveStatusText }}</view>
		<view class="action-row">
			<button class="action-btn secondary" @click="$emit('reset')">恢复默认</button>
			<button class="action-btn primary" :loading="saveStatus === 'saving'" @click="$emit('save')">
				{{ saveStatus === 'saving' ? '保存中…' : '保存模板' }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TemplateBottomActions',
	props: {
		saveStatus: { type: String, default: 'idle' }
	},
	computed: {
		saveStatusText() {
			const map = {
				dirty: '未保存',
				saving: '保存中…',
				saved: '已保存',
				error: '保存失败'
			}
			return map[this.saveStatus] || ''
		}
	}
}
</script>

<style scoped>
.bottom-actions {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fff;
	border-top: 2rpx solid #e8eaed;
	padding: 16rpx 32rpx;
	padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
	z-index: 100;
}

.status-text {
	text-align: center;
	font-size: 24rpx;
	color: #8a8a8a;
	margin-bottom: 12rpx;
}

.status-text:empty {
	display: none;
}

.action-row {
	display: flex;
	gap: 24rpx;
}

.action-btn {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	font-size: 30rpx;
	border-radius: 44rpx;
	border: none;
}

.action-btn.secondary {
	background: #f0f2f5;
	color: #666;
}

.action-btn.primary {
	background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
	color: #fff;
	font-weight: 600;
}
</style>

<template>
	<view class="field-list">
		<view class="section">
			<view class="section-row">
				<text class="section-title">订单信息字段</text>
				<text class="count-badge">{{ fields.length }} 项</text>
			</view>

			<view v-if="fields.length === 0" class="empty-tip">暂无显示字段，点击下方添加</view>

			<view class="field-items">
				<view v-for="(field, index) in fields" :key="field.key" class="field-item">
					<text class="field-label">{{ field.label }}</text>
					<view class="field-actions">
						<view class="sort-btn" :class="{ disabled: index === 0 }" @click="$emit('move-up', field.key)">
							<uni-icons type="up" size="18" color="#666" />
						</view>
						<view class="sort-btn" :class="{ disabled: index === fields.length - 1 }" @click="$emit('move-down', field.key)">
							<uni-icons type="down" size="18" color="#666" />
						</view>
						<view class="action-text" @click="$emit('edit', field.key)">编辑</view>
						<view class="action-text danger" @click="$emit('hide', field.key)">隐藏</view>
					</view>
				</view>
			</view>

			<view class="add-btn" @click="$emit('add')">
				<uni-icons type="plus" size="20" color="#4A90E2" />
				<text>添加字段</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TemplateFieldList',
	props: {
		fields: { type: Array, default: () => [] }
	}
}
</script>

<style scoped>
.section {
	background-color: #fff;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 28rpx;
}

.section-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1a1a1a;
}

.count-badge {
	font-size: 24rpx;
	color: #8a8a8a;
	background: #f0f2f5;
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
}

.empty-tip {
	font-size: 28rpx;
	color: #999;
	text-align: center;
	padding: 40rpx 0;
}

.field-items {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	margin-bottom: 24rpx;
}

.field-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	background: linear-gradient(145deg, #fafbfc, #f5f6f7);
	border-radius: 16rpx;
	border: 2rpx solid #e8eaed;
}

.field-label {
	flex: 1;
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
}

.field-actions {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.sort-btn {
	width: 52rpx;
	height: 52rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	border-radius: 12rpx;
	border: 2rpx solid #e8eaed;
}

.sort-btn.disabled {
	opacity: 0.3;
}

.action-text {
	font-size: 26rpx;
	color: #4A90E2;
	padding: 8rpx 12rpx;
}

.action-text.danger {
	color: #F56C6C;
}

.add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	font-size: 28rpx;
	color: #4A90E2;
	padding: 24rpx;
	background: rgba(74, 144, 226, 0.08);
	border-radius: 16rpx;
	border: 2rpx dashed rgba(74, 144, 226, 0.3);
}
</style>

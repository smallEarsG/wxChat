<template>
	<view class="basic-settings">
		<view class="section">
			<view class="section-title">模板名称</view>
			<input
				class="input-field"
				:value="templateName"
				placeholder="请输入模板名称"
				@input="$emit('update:templateName', $event.detail.value)"
			/>
		</view>

		<view class="section">
			<view class="section-title">条形码设置</view>
			<view class="option-card">
				<view class="option-content">
					<view class="option-icon" :class="{ active: showBarcode }">
						<uni-icons type="checkmark" size="24" />
					</view>
					<text class="option-text">显示商户单号条形码</text>
				</view>
				<switch :checked="showBarcode" color="#4A90E2" @change="$emit('barcode-change', $event)" />
			</view>
		</view>

		<view class="summary-card" @click="$emit('go-preview')">
			<text class="summary-text">已启用 {{ enabledFieldCount }} 个字段、{{ enabledServiceCount }} 个服务项</text>
			<view class="summary-link">
				<text>查看预览</text>
				<uni-icons type="right" size="16" color="#4A90E2" />
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TemplateBasicSettings',
	props: {
		templateName: { type: String, default: '' },
		showBarcode: { type: Boolean, default: false },
		enabledFieldCount: { type: Number, default: 0 },
		enabledServiceCount: { type: Number, default: 0 }
	}
}
</script>

<style scoped>
.basic-settings {
	display: flex;
	flex-direction: column;
	gap: 28rpx;
}

.section {
	background-color: #fff;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1a1a1a;
	margin-bottom: 28rpx;
}

.input-field {
	width: 100%;
	height: 88rpx;
	background: linear-gradient(145deg, #fafbfc, #f5f6f7);
	border-radius: 16rpx;
	padding: 0 28rpx;
	font-size: 30rpx;
	box-sizing: border-box;
	border: 2rpx solid #e8eaed;
}

.option-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx;
	background: linear-gradient(145deg, #fafbfc, #f5f6f7);
	border-radius: 16rpx;
	border: 2rpx solid #e8eaed;
}

.option-content {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.option-icon {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f0f2f5;
	border-radius: 50%;
	color: #ccc;
}

.option-icon.active {
	background: #4A90E2;
	color: #fff;
}

.option-text {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
}

.summary-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 32rpx;
	background: #fff;
	border-radius: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.summary-text {
	font-size: 26rpx;
	color: #666;
}

.summary-link {
	display: flex;
	align-items: center;
	gap: 4rpx;
	font-size: 26rpx;
	color: #4A90E2;
}
</style>

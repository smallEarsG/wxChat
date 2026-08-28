<template>
	<view class="preview-panel">
		<view class="section">
			<view class="section-title">模板预览</view>

			<view class="control-row">
				<text class="control-label">预览比例</text>
				<view class="control-options">
					<view
						class="option-chip"
						:class="{ active: previewScale === 75 }"
						@click="$emit('update:previewScale', 75)"
					>75%</view>
					<view
						class="option-chip"
						:class="{ active: previewScale === 100 }"
						@click="$emit('update:previewScale', 100)"
					>100%</view>
				</view>
			</view>

			<view class="control-row">
				<text class="control-label">模拟数据</text>
				<view class="control-options preview-data-options">
					<view
						class="option-chip"
						:class="{ active: previewDataType === 'transfer' }"
						@click="$emit('update:previewDataType', 'transfer')"
					>微信转账</view>
					<view
						class="option-chip"
						:class="{ active: previewDataType === 'merchant' }"
						@click="$emit('update:previewDataType', 'merchant')"
					>商户付款</view>
					<view
						class="option-chip"
						:class="{ active: previewDataType === 'miniProgram' }"
						@click="$emit('update:previewDataType', 'miniProgram')"
					>小程序付款</view>
				</view>
			</view>
		</view>

		<view class="preview-wrapper">
			<view class="preview-scale" :style="{ transform: `scale(${previewScale / 100})` }">
				<CustomBill :info="previewInfo" :config="templateConfig" :previewMode="true" />
			</view>
		</view>
	</view>
</template>

<script>
import CustomBill from '@/components/bill-preview/CustomBill.vue'

export default {
	name: 'TemplatePreview',
	components: { CustomBill },
	props: {
		previewInfo: { type: Object, default: () => ({}) },
		templateConfig: { type: Object, default: () => ({}) },
		previewScale: { type: Number, default: 100 },
		previewDataType: { type: String, default: 'transfer' }
	}
}
</script>

<style scoped>
.preview-panel {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.section {
	background: #fff;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1a1a1a;
	margin-bottom: 24rpx;
}

.control-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.control-row:last-child {
	margin-bottom: 0;
}

.control-label {
	font-size: 28rpx;
	color: #666;
}

.control-options {
	display: flex;
	gap: 16rpx;
}

.preview-data-options {
	flex-wrap: wrap;
	justify-content: flex-end;
}

.option-chip {
	padding: 12rpx 28rpx;
	font-size: 26rpx;
	color: #666;
	background: #f0f2f5;
	border-radius: 28rpx;
}

.option-chip.active {
	color: #fff;
	background: #4A90E2;
}

.preview-wrapper {
	background: linear-gradient(145deg, #f5f7fa, #eff1f4);
	border-radius: 24rpx;
	padding: 24rpx;
	overflow: auto;
	border: 2rpx dashed #d0d3d8;
	min-height: 600rpx;
}

.preview-scale {
	transform-origin: top center;
}
</style>

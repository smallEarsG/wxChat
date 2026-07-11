<template>
	<view class="container">
		<WatermarkLayer />

		<view class="header">
			<view class="back-btn" @click="goBack">
				<uni-icons type="arrowleft" size="30" color="#333" />
			</view>
			<text class="page-title">确认识别结果</text>
			<view class="spacer"></view>
		</view>

		<scroll-view scroll-y class="content">
			<view class="summary-card">
				<text class="summary-title">识别完成</text>
				<text class="summary-count">{{ recognizedCount }} 个字段</text>
			</view>

			<view class="field-card" v-for="field in fields" :key="field.key">
				<text class="field-label">{{ field.label }}</text>
				<input
					class="field-input"
					v-model="formData[field.key]"
					:placeholder="`请输入${field.label}`"
				/>
			</view>

			<view class="missing-card" v-if="missingFields.length > 0">
				<text class="missing-title">未识别字段</text>
				<text class="missing-text">{{ missingFields.join('、') }}</text>
			</view>
		</scroll-view>

		<view class="footer-actions">
			<button class="secondary-btn" @click="reRecognize">重新识别</button>
			<button class="primary-btn" @click="goSelectTemplate">下一步选择模板</button>
		</view>
	</view>
</template>

<script>
import { RECOGNITION_FIELDS, getMissingFields, countRecognizedFields } from '@/config/billFields.js'

export default {
	data() {
		return {
			formData: {},
			fields: RECOGNITION_FIELDS
		}
	},
	computed: {
		missingFields() {
			return getMissingFields(this.formData)
		},
		recognizedCount() {
			return countRecognizedFields(this.formData)
		}
	},
	onLoad(options) {
		if (options.info) {
			try {
				this.formData = JSON.parse(decodeURIComponent(options.info))
			} catch (e) {
				this.formData = {}
			}
		}
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		reRecognize() {
			uni.navigateBack()
		},
		goSelectTemplate() {
			const info = encodeURIComponent(JSON.stringify(this.formData))
			uni.navigateTo({
				url: `/pages/bill-template-gallery/bill-template-gallery?from=recognition&info=${info}`
			})
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: #f5f7fa;
	display: flex;
	flex-direction: column;
}

.header {
	height: 100rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	background: #fff;
}

.back-btn, .spacer {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.page-title {
	flex: 1;
	text-align: center;
	font-size: 34rpx;
	font-weight: 600;
}

.content {
	flex: 1;
	padding: 24rpx;
	box-sizing: border-box;
}

.summary-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #fff;
	border-radius: 16rpx;
	padding: 28rpx;
	margin-bottom: 24rpx;
}

.summary-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.summary-count {
	font-size: 26rpx;
	color: #4A90E2;
}

.field-card {
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
}

.field-label {
	display: block;
	font-size: 24rpx;
	color: #888;
	margin-bottom: 12rpx;
}

.field-input {
	width: 100%;
	font-size: 28rpx;
	color: #333;
	padding: 12rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.missing-card {
	background: #fff7e6;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-top: 8rpx;
}

.missing-title {
	display: block;
	font-size: 24rpx;
	color: #e6a23c;
	margin-bottom: 8rpx;
}

.missing-text {
	font-size: 26rpx;
	color: #666;
}

.footer-actions {
	display: flex;
	padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
	background: #fff;
	border-top: 1rpx solid #eee;
}

.secondary-btn,
.primary-btn {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 16rpx;
	font-size: 28rpx;
}

.secondary-btn {
	margin-right: 20rpx;
	background: #f5f7fa;
	color: #333;
}

.primary-btn {
	background: linear-gradient(135deg, #4A90E2, #3A80D2);
	color: #fff;
}
</style>

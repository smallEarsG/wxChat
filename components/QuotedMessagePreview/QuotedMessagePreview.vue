<template>
	<view class="quote-preview" :style="scaleStyle">
		<view class="quote-header">{{ headerText }}</view>
		<view class="quote-body">
			<image v-if="quote.previewImage" class="quote-thumb" :src="quote.previewImage" mode="aspectFill" />
			<view class="quote-text">
				<template v-for="(part, partIndex) in parseMessage(quote.previewText)">
					<text v-if="part.type === 'text'" :key="'text-' + partIndex" class="quote-text__part">{{ part.content }}</text>
					<text v-else-if="part.type === 'url'" :key="'url-' + partIndex" class="quote-text__part">{{ part.content }}</text>
					<text v-else-if="part.type === 'email'" :key="'email-' + partIndex" class="quote-text__part">{{ part.content }}</text>
					<text v-else-if="part.type === 'number'" :key="'number-' + partIndex" class="quote-text__part">{{ part.content }}</text>
					<image v-else-if="part.type === 'emoji'" :key="'emoji-' + partIndex" :src="getEmojiUrl(part.index, location)"
						class="quote-emoji" mode="aspectFit" />
				</template>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'QuotedMessagePreview',
	props: {
		quote: { type: Object, required: true },
		location: { type: Number, default: 0 },
		fontScale: { type: Number, default: 1 },
		parseMessage: { type: Function, required: true },
		getEmojiUrl: { type: Function, required: true }
	},
	computed: {
		scaleStyle() {
			const scale = Number(this.fontScale) || 1
			return { zoom: scale }
		},
		headerText() {
			const fromName = (this.quote && this.quote.fromName) ? this.quote.fromName : ''
			return fromName ? `${fromName}:` : ''
		}
	}
}
</script>

<style scoped>
.quote-preview {
	padding: 14rpx 16rpx;
	background: rgba(0, 0, 0, 0.04);
	border-left: 6rpx solid rgba(0, 0, 0, 0.18);
	border-radius: 10rpx;
	margin-bottom: 14rpx;
	min-width: 210rpx;
}

.quote-header {
	font-size: 24rpx;
	line-height: 32rpx;
	color: rgba(0, 0, 0, 0.55);
	margin-bottom: 6rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.quote-body {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.quote-thumb {
	width: 54rpx;
	height: 54rpx;
	border-radius: 8rpx;
	flex-shrink: 0;
}

.quote-text {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	white-space: normal;
	word-break: break-all;
}

.quote-text__part {
	font-size: 26rpx;
	line-height: 34rpx;
	color: rgba(0, 0, 0, 0.75);
}

.quote-emoji {
	width: 28rpx;
	height: 28rpx;
	vertical-align: middle;
}
</style>

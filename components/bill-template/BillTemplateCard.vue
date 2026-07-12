<template>
	<view class="template-card" @click="$emit('use', template.key)">
		<!-- <view class="card-preview">
			<view class="preview-placeholder">
				<uni-icons type="image" size="36" color="#bbb" />
			</view>
			<view class="badge recent" v-if="isRecent">最近</view>
			<view class="badge favorite" v-if="isFavorite">收藏</view>
		</view> -->
		<view class="card-body">
			<view class="badge-row" style="height: 40rpx;float: right;">
				<view class="badge recent" v-if="isRecent">最近</view>
				<view class="badge favorite" v-if="isFavorite">收藏</view>
			</view>
			<view class="card-title-row" style="overflow: hidden;">
				
				<text class="card-title">{{ template.title }}</text>
				<view class="favorite-btn" @click.stop="$emit('toggle-favorite', template.key)">
					<uni-icons :type="isFavorite ? 'star-filled' : 'star'" size="20" :color="isFavorite ? '#f5a623' : '#ccc'" />
				</view>
			</view>
			<text class="card-desc">{{ template.description }}</text>
			<view class="card-footer">
				<text class="card-category">{{ categoryLabel }}</text>
				<button class="use-btn" size="mini" @click.stop="$emit('use', template.key)">使用模板</button>
			</view>
		</view>
	</view>
</template>

<script>
import { TEMPLATE_CATEGORIES } from '@/config/billTemplates.js'

export default {
	name: 'BillTemplateCard',
	props: {
		template: {
			type: Object,
			required: true
		},
		isRecent: {
			type: Boolean,
			default: false
		},
		isFavorite: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		categoryLabel() {
			return TEMPLATE_CATEGORIES[this.template.category]?.label || '模板'
		}
	}
}
</script>

<style scoped>
.template-card {
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
	margin-bottom: 24rpx;
}

.badge-row {
	display: flex;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.badge {
	padding: 4rpx 14rpx;
	border-radius: 20rpx;
	font-size: 20rpx;
	color: #fff;
}

.badge.recent {
	background: #4A90E2;
}

.badge.favorite {
	background: #f5a623;
}

.card-body {
	padding: 24rpx;
}

.card-title-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10rpx;
}

.card-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.card-desc {
	font-size: 24rpx;
	color: #888;
	line-height: 1.5;
}

.card-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 20rpx;
}

.card-category {
	font-size: 22rpx;
	color: #4A90E2;
	background: rgba(74, 144, 226, 0.1);
	padding: 4rpx 14rpx;
	border-radius: 20rpx;
}

.use-btn {
	margin: 0;
	background: #4A90E2;
	color: #fff;
	border: none;
	font-size: 24rpx;
}
</style>

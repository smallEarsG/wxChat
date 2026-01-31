<template>
	<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
		<view class="back-btn" @click="goBack" v-if="showBack">
			<uni-icons :type="backIcon" :size="backIconSize" :color="backIconColor" />
		</view>
		<view class="title-wrapper">
			<text class="page-title" :style="titleStyle">{{ title }}</text>
			<text class="page-subtitle" v-if="subtitle" :style="subtitleStyle">{{ subtitle }}</text>
		</view>
		<view class="right-actions">
			<slot name="actions"></slot>
		</view>
	</view>
</template>

<script>
export default {
	name: 'CommonHeader',
	props: {
		// 标题
		title: {
			type: String,
			default: ''
		},
		// 副标题
		subtitle: {
			type: String,
			default: ''
		},
		// 是否显示返回按钮
		showBack: {
			type: Boolean,
			default: true
		},
		// 返回按钮图标
		backIcon: {
			type: String,
			default: 'arrowleft'
		},
		// 返回按钮尺寸
		backIconSize: {
			type: Number,
			default: 30
		},
		// 返回按钮颜色
		backIconColor: {
			type: String,
			default: '#333'
		},
		// 背景色
		backgroundColor: {
			type: String,
			default: '#fff'
		},
		// 标题样式
		titleStyle: {
			type: Object,
			default: () => ({
				fontSize: '36rpx',
				color: '#333',
				fontWeight: 'bold'
			})
		},
		// 副标题样式
		subtitleStyle: {
			type: Object,
			default: () => ({
				fontSize: '24rpx',
				color: '#666'
			})
		}
	},
	data() {
		return {
			statusBarHeight: uni.getSystemInfoSync().statusBarHeight
		}
	},
	methods: {
		goBack() {
			this.$emit('back');
			if (!this.$listeners.back) {
				uni.navigateBack();
			}
		}
	}
}
</script>

<style scoped>
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 40rpx;
	background: v-bind(backgroundColor);
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
	width: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.title-wrapper {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.page-title {
	line-height: 1.2;
}

.page-subtitle {
	line-height: 1;
	margin-top: 8rpx;
}

.right-actions {
	width: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>

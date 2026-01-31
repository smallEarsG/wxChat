<template>
	<uni-popup ref="popup" :type="type" :is-mask-click="isMaskClick">
		<view class="popup-container" :class="containerClass">
			<!-- 头部 -->
			<view class="popup-header" v-if="showHeader">
				<text class="popup-title">{{ title }}</text>
				<view class="close-btn" @click="close" v-if="showClose">
					<uni-icons type="close" size="24" color="#666" />
				</view>
			</view>
			
			<!-- 内容区域 -->
			<view class="popup-content">
				<slot></slot>
			</view>
			
			<!-- 底部按钮区域 -->
			<view class="popup-footer" v-if="showFooter">
				<view class="btn-group">
					<button 
						v-if="showCancel"
						class="btn btn-cancel" 
						@click="handleCancel"
					>
						{{ cancelText }}
					</button>
					<button 
						v-if="showConfirm"
						class="btn btn-confirm" 
						@click="handleConfirm"
					>
						{{ confirmText }}
					</button>
				</view>
			</view>
		</view>
	</uni-popup>
</template>

<script>
export default {
	name: 'CommonPopup',
	props: {
		// 弹窗类型：center, bottom, top, left, right
		type: {
			type: String,
			default: 'center'
		},
		// 点击遮罩是否关闭
		isMaskClick: {
			type: Boolean,
			default: true
		},
		// 标题
		title: {
			type: String,
			default: ''
		},
		// 是否显示头部
		showHeader: {
			type: Boolean,
			default: true
		},
		// 是否显示关闭按钮
		showClose: {
			type: Boolean,
			default: true
		},
		// 是否显示底部
		showFooter: {
			type: Boolean,
			default: false
		},
		// 是否显示取消按钮
		showCancel: {
			type: Boolean,
			default: true
		},
		// 是否显示确认按钮
		showConfirm: {
			type: Boolean,
			default: true
		},
		// 取消按钮文字
		cancelText: {
			type: String,
			default: '取消'
		},
		// 确认按钮文字
		confirmText: {
			type: String,
			default: '确认'
		},
		// 自定义容器样式类
		containerClass: {
			type: String,
			default: ''
		}
	},
	methods: {
		open() {
			this.$refs.popup.open();
		},
		close() {
			this.$refs.popup.close();
			this.$emit('close');
		},
		handleCancel() {
			this.$emit('cancel');
			this.close();
		},
		handleConfirm() {
			this.$emit('confirm');
			// 不自动关闭，让父组件决定是否关闭
		}
	}
}
</script>

<style scoped>
.popup-container {
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	max-width: 90vw;
	max-height: 80vh;
}

.popup-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx 40rpx;
	border-bottom: 2rpx solid #f5f5f5;
}

.popup-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.close-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.popup-content {
	padding: 40rpx;
	max-height: 60vh;
	overflow-y: auto;
}

.popup-footer {
	padding: 32rpx 40rpx;
	border-top: 2rpx solid #f5f5f5;
}

.btn-group {
	display: flex;
	gap: 24rpx;
}

.btn {
	flex: 1;
	height: 80rpx;
	border-radius: 8rpx;
	border: none;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-cancel {
	background: #f5f5f5;
	color: #666;
}

.btn-confirm {
	background: #007aff;
	color: #fff;
}

.btn:active {
	opacity: 0.8;
}
</style>

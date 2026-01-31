<template>
	<view v-if="visible" class="popup-menu" :style="styleObject">
		<view
			v-for="(action, idx) in actions"
			:key="idx"
			class="menu-item"
			@click="handleClick(action, idx)"
			@touchstart="handleTouchStart(action, idx)"
		>
			<uni-icons :type="action.icon" color="#999" size="25"></uni-icons>
			<text>{{ action.label }}</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'MessagePopupMenu',
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		styleObject: {
			type: Object,
			default: () => ({})
		},
		actions: {
			type: Array,
			default: () => []
		},
		messageIndex: {
			type: Number,
			default: -1
		}
	},
	methods: {
		handleClick(action, idx) {
			this.$emit('action', {
				action: action.method,
				index: this.messageIndex
			});
		},
		handleTouchStart(action, idx) {
			// 某些操作需要在 touchstart 时触发（如视频电话的删除）
			if (action.triggerOnTouchStart) {
				this.$emit('action', {
					action: action.method,
					index: this.messageIndex
				});
			}
		}
	}
};
</script>

<style scoped>
/* 弹出菜单样式 */
.popup-menu {
	pointer-events: auto;
	position: fixed;
	background-color: rgba(0, 0, 0, 0.85);
	color: white;
	border-radius: 12upx;
	padding: 15upx 20upx;
	z-index: 9999;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: flex-start;
	align-items: flex-start;
	overflow: hidden;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
	backdrop-filter: blur(8px);
	transform-origin: center;
	max-width: 90vw;
	gap: 10upx;
}

.menu-item {
	padding: 15upx 25upx;
	font-size: 28upx;
	display: flex;
	flex-direction: column;
	align-items: center;
	white-space: nowrap;
	cursor: pointer;
	transition: all 0.2s ease;
	border-radius: 10upx;
	min-width: 80upx;
	flex-shrink: 0;
}

.menu-item:hover {
	background-color: rgba(255, 255, 255, 0.1);
	transform: translateY(-2upx);
}

.menu-item:active {
	transform: scale(0.95);
}

.menu-item text {
	margin-top: 8upx;
	color: white;
}
</style>

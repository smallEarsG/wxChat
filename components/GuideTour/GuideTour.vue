<template>
	<view v-if="visible" class="guide-tour" @touchmove.stop.prevent>
		<view
			class="guide-mask guide-mask-top"
			:style="{ height: mask.top + 'px' }"
			@click="handleMaskClick"
		/>
		<view class="guide-mask-row" :style="{ top: mask.top + 'px', height: mask.height + 'px' }">
			<view
				class="guide-mask guide-mask-left"
				:style="{ width: mask.left + 'px' }"
				@click="handleMaskClick"
			/>
			<view class="guide-highlight" :style="highlightStyle" />
			<view
				class="guide-mask guide-mask-right"
				:style="{ width: mask.right + 'px' }"
				@click="handleMaskClick"
			/>
		</view>
		<view
			class="guide-mask guide-mask-bottom"
			:style="{ top: mask.top + mask.height + 'px' }"
			@click="handleMaskClick"
		/>

		<view class="guide-tooltip" :style="tooltipStyle" v-if="currentStep">
			<view class="guide-tooltip-header">
				<text class="guide-step-index">{{ currentIndex + 1 }}/{{ steps.length }}</text>
				<text class="guide-skip" @click="skip">跳过</text>
			</view>
			<text class="guide-title">{{ currentStep.title }}</text>
			<text class="guide-content">{{ currentStep.content }}</text>
			<view class="guide-actions">
				<button
					v-if="currentIndex > 0"
					class="guide-btn guide-btn-prev"
					@click="prev"
				>上一步</button>
				<button class="guide-btn guide-btn-next" @click="next">
					{{ currentIndex < steps.length - 1 ? '下一步' : '知道了' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'GuideTour',
		props: {
			visible: {
				type: Boolean,
				default: false
			},
			steps: {
				type: Array,
				default: () => []
			},
			padding: {
				type: Number,
				default: 8
			},
			context: {
				type: Object,
				default: null
			}
		},
		data() {
			const sys = uni.getSystemInfoSync()
			return {
				currentIndex: 0,
				windowWidth: sys.windowWidth,
				windowHeight: sys.windowHeight,
				mask: {
					top: 0,
					left: 0,
					right: 0,
					height: 0
				},
				tooltipTop: 0
			}
		},
		computed: {
			currentStep() {
				return this.steps[this.currentIndex] || null
			},
			highlightStyle() {
				return {
					width: this.mask.highlightWidth + 'px',
					height: this.mask.height + 'px'
				}
			},
			tooltipStyle() {
				const safePadding = 16
				const maxHeight = Math.max(120, this.windowHeight - this.tooltipTop - safePadding)
				return {
					left: '32rpx',
					right: '32rpx',
					top: this.tooltipTop + 'px',
					maxHeight: maxHeight + 'px'
				}
			}
		},
		watch: {
			visible(val) {
				if (val) {
					this.currentIndex = 0
					this.$nextTick(() => {
						this.emitStepChange()
						setTimeout(() => this.updatePosition(), 100)
					})
				}
			},
			currentIndex() {
				this.$nextTick(() => {
					this.emitStepChange()
					const delay = (this.currentStep && this.currentStep.delay) || 100
					setTimeout(() => this.updatePosition(), delay)
				})
			}
		},
		methods: {
			emitStepChange() {
				this.$emit('step-change', this.currentIndex)
			},
			getQueryContext() {
				return this.context || this.$parent || this
			},
			updatePosition() {
				const step = this.currentStep
				if (!step || !step.selector) return

				const query = uni.createSelectorQuery().in(this.getQueryContext())
				query.select(step.selector).boundingClientRect((rect) => {
					if (!rect || !rect.width) return

					const pad = step.padding != null ? step.padding : this.padding
					const safeTop = step.safeTop != null ? step.safeTop : 0
					const safeBottom = step.safeBottom != null ? step.safeBottom : 0
					let top = Math.max(safeTop, rect.top - pad)
					let left = Math.max(0, rect.left - pad)
					let width = Math.min(rect.width + pad * 2, this.windowWidth - left)
					let height = rect.height + pad * 2

					const viewportHeight = this.windowHeight - safeTop - safeBottom
					const maxHighlightHeight = step.maxHeight != null
						? step.maxHeight
						: (step.maxHighlightHeight != null
							? step.maxHighlightHeight
							: Math.floor(viewportHeight * 0.55))
					if (height > maxHighlightHeight) {
						height = maxHighlightHeight
					}
					if (top + height > this.windowHeight - safeBottom) {
						height = Math.max(80, this.windowHeight - safeBottom - top)
					}

					const right = Math.max(0, this.windowWidth - left - width)

					this.mask = {
						top,
						left,
						right,
						height,
						highlightWidth: width
					}

					this.tooltipTop = this.calcTooltipTop(top, height, step, safeTop, safeBottom)
				}).exec()
			},
			calcTooltipTop(highlightTop, highlightHeight, step, safeTop, safeBottom) {
				const gap = 16
				const safePadding = 16
				const tooltipHeight = step.tooltipHeight || 220
				const highlightBottom = highlightTop + highlightHeight
				const bottomLimit = this.windowHeight - safeBottom - safePadding
				const topLimit = safeTop + safePadding
				const bottomSpace = bottomLimit - highlightBottom
				const topSpace = highlightTop - topLimit

				let tooltipTop = 0
				if (bottomSpace >= tooltipHeight + gap) {
					tooltipTop = highlightBottom + gap
				} else if (topSpace >= tooltipHeight + gap) {
					tooltipTop = highlightTop - gap - tooltipHeight
				} else {
					tooltipTop = (this.windowHeight - safeTop - safeBottom - tooltipHeight) / 2 + safeTop
				}

				return Math.max(topLimit, Math.min(tooltipTop, bottomLimit - tooltipHeight))
			},
			handleMaskClick() {},
			prev() {
				if (this.currentIndex > 0) {
					this.currentIndex -= 1
				}
			},
			next() {
				if (this.currentIndex < this.steps.length - 1) {
					this.currentIndex += 1
					return
				}
				this.finish()
			},
			skip() {
				this.$emit('skip')
			},
			finish() {
				this.$emit('finish')
			}
		}
	}
</script>

<style scoped>
	.guide-tour {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 10000;
	}

	.guide-mask {
		position: fixed;
		left: 0;
		right: 0;
		background-color: rgba(0, 0, 0, 0.65);
	}

	.guide-mask-row {
		position: fixed;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: row;
	}

	.guide-mask-left,
	.guide-mask-right {
		position: relative;
		flex-shrink: 0;
	}

	.guide-highlight {
		flex-shrink: 0;
		border-radius: 12rpx;
		box-shadow: 0 0 0 4rpx rgba(38, 126, 240, 0.9);
		background-color: transparent;
	}

	.guide-tooltip {
		position: fixed;
		background: #fff;
		border-radius: 20rpx;
		padding: 28rpx 32rpx 24rpx;
		box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
		overflow-y: auto;
		box-sizing: border-box;
	}

	.guide-tooltip-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.guide-step-index {
		font-size: 24rpx;
		color: #267ef0;
	}

	.guide-skip {
		font-size: 24rpx;
		color: #999;
		padding: 8rpx;
	}

	.guide-title {
		display: block;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 12rpx;
	}

	.guide-content {
		display: block;
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 28rpx;
	}

	.guide-actions {
		display: flex;
		justify-content: flex-end;
		gap: 16rpx;
	}

	.guide-btn {
		margin: 0;
		padding: 0 36rpx;
		height: 72rpx;
		line-height: 72rpx;
		font-size: 28rpx;
		border-radius: 12rpx;
		border: none;
	}

	.guide-btn-prev {
		background: #f5f7fa;
		color: #666;
	}

	.guide-btn-next {
		background: #267ef0;
		color: #fff;
	}

	.guide-btn::after {
		border: none;
	}
</style>

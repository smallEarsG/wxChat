<template>
	<GuideTour
		:visible="showGuide"
		:steps="guideSteps"
		:context="$parent"
		@finish="finishGuide"
		@skip="finishGuide"
	/>
</template>

<script>
	import GuideTour from '@/components/GuideTour/GuideTour.vue'

	const DEFAULT_STEPS = [
		{
			selector: '.guide-step-back',
			title: '返回',
			content: '点击左上角关闭按钮可返回模板列表'
		},
		{
			selector: '.guide-step-avatar',
			title: '更换头像',
			content: '点击头像可选择或添加收款方头像'
		},
		{
			selector: '.guide-step-content',
			title: '编辑账单',
			content: '点击账单区域可修改金额、时间、单号等字段，保存后可在记录中查看'
		}
	]

	export default {
		name: 'BillTemplateGuide',
		components: {
			GuideTour
		},
		props: {
			templateKey: {
				type: String,
				required: true
			}
		},
		data() {
			return {
				showGuide: false,
				guideSteps: DEFAULT_STEPS
			}
		},
		mounted() {
			this.checkFirstTimeGuide()
		},
		methods: {
			storageKey() {
				return `billGuide_${this.templateKey}_hasSeenGuide`
			},
			checkFirstTimeGuide() {
				const hasSeenGuide = uni.getStorageSync(this.storageKey())
				if (hasSeenGuide) return
				this.$nextTick(() => {
					setTimeout(() => {
						this.showGuide = true
					}, 400)
				})
			},
			finishGuide() {
				uni.setStorageSync(this.storageKey(), true)
				this.showGuide = false
			},
			openGuide() {
				this.showGuide = false
				this.$nextTick(() => {
					setTimeout(() => {
						this.showGuide = true
					}, 100)
				})
			}
		}
	}
</script>

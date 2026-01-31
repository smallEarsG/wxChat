<template>
	<view v-if="showWatermark" class="watermark-layer"></view>
</template>

<script>
import watermarkMixin from '@/mixins/watermarkMixin.js'

export default {
	mixins: [watermarkMixin],
	name: 'WatermarkLayer'
}
</script>

<style scoped>
/* 水印样式在 App.vue 中定义，这里不需要重复定义 */
</style>


<template>
  <view class="container">
    <!-- 缩放后的文本 -->
    <text :style="{ fontSize: px(14) }">我是可缩放文字</text>

    <!-- 缩放后的盒子 -->
    <view :style="{ width: rpx(200), height: rpx(100), backgroundColor: '#eee', marginTop: rpx(20) }"></view>

    <!-- 控制缩放的滑块 -->
    <slider
      :value="scale"
      :min="0.8"
      :max="1.5"
      :step="0.1"
      @changing="onScaleChange"
    />
  </view>
</template>

<script>
import scaleMixin from '@/mixins/scaleMixin.js'
import { setScale } from '@/utils/scale.js'

export default {
  mixins: [scaleMixin],
  methods: {
    onScaleChange(e) {
      this.scale = e.detail.value
      setScale(this.scale)
    }
  }
}
</script>

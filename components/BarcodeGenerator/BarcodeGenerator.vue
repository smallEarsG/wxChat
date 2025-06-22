<template>
  <view class="container_z" :style="{width:width}" >
    <canvas canvas-id="barcode-canvas" />
  </view>
</template>

<script>
import JsBarcode from 'jsbarcode'

export default {
  name: "BarcodeGenerator",
  props: {
    content: {
      type: String,
      required: true
    },
	width:{
		type: String,
		required: true
	}
  },
  mounted() {
    this.drawBarcode()
  },
  watch: {
    content() {
      this.drawBarcode()
    }
  },
  methods: {
    drawBarcode() {
      // 直接创建 CanvasContext，注意：barcode-canvas 必须和 canvas-id 一致
      const ctx = uni.createCanvasContext('barcode-canvas', this)

      // 创建一个离屏Canvas模拟DOM Canvas，用于传给 jsbarcode
      const query = uni.createSelectorQuery().in(this)
      query.select('canvas')
        .boundingClientRect(rect => {
          const width = rect.width
          const height = rect.height

          // UniApp 没有DOM原生canvas对象，我们手动模拟canvas对象
          const _canvas = {
            width: width,
            height: height,
            getContext: () => ctx,
            style: {}  // jsbarcode内部会访问style
          }

          try {
            JsBarcode(_canvas, this.content, {
              format: "CODE128",
              lineColor: "#000000",
              width: 1,
              height: 50,
              displayValue: false,
			  // fontSize:18
			  textAlign:"left",
		
			  margin:0
            })
            ctx.draw()
          } catch (e) {
            console.error("条形码绘制失败", e)
          }
        })
        .exec()
    }
  }
}
</script>

<style scoped>
.container_z {
 /* display: flex; */
  /* justify-content: flex-start; */
  /* align-items: center; */
  position: relative;
  /* left: -20rpx; */
  /* background-color: bisque; */
  overflow: hidden; 
  height: 102rpx;
}
.barcode-canvas{
	 /* height: 110rpx; */
}
</style>

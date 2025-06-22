

export default {
  computed: {
	  scale() {
	      return this.$store.state.scale
	    },
    // 封装样式辅助函数（你也可以直接在模板用）
    rpx() {
      return (v) => `${v * this.scale}rpx`
    },
    px() {
      return (v) => `${v * this.scale}px`
    }
  },
 
}

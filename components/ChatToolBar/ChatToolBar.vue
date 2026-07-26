<template>
  <scroll-view class="chat-toolbar" scroll-x :show-scrollbar="false" :style="{ fontSize: rpx(28) }">
    <view
      v-for="item in items"
      :key="item.id"
      class="tool-item"
      @click="onClick(item)"
    >
      <view class="icon-circle" :style="{ width: rpx(34), height: rpx(34) }">
        <image :src="item.icon" class="tool-icon" mode="aspectFill" />
      </view>
      <text class="tool-label">{{ item.label }}</text>
    </view>
  </scroll-view>
</template>

<script>
import scaleMixin from '@/mixins/scaleMixin.js'

export default {
  mixins: [scaleMixin],
  name: 'ChatToolBar',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onClick(item) {
      this.$emit('click', item);
    }
  }
};
</script>

<style scoped>
.chat-toolbar {
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  padding: 20upx 10upx;
  background-color: #f5f5f5;
  padding-bottom: 0;
  text-align: center;
  align-self: center;
}
.chat-toolbar ::-webkit-scrollbar {
  display: none;
}
.tool-item {
  display: inline-flex;
  align-items: center;
  background-color: #ffffff;
  padding: 8upx 18upx;
  border-radius: 40upx;
  margin-left: 20upx;
  box-shadow: 0 2upx 6upx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.icon-circle {
  width: 34upx;
  height: 34upx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5upx;
  padding: 4upx 0;
  overflow: hidden;
}
.icon-circle image {
  width: 100%;
  height: 100%;
}

.tool-label {
  color: #333;
}
</style>

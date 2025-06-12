<template>
  <view class="emoji-picker">
    <view 
      v-for="index in total" 
      :key="index"
      class="emoji-item"
      :style="getStyle(index - 1)"
      @click="onSelect(index - 1)"
    />
  </view>
</template>

<script>
export default {
  name: 'EmojiPicker',
  props: {
    onEmojiSelect: Function // 点击回调
  },
  data() {
    return {
      // sprite图参数
      spriteUrl: '/static/emoji/emoji.png',
      spriteWidth: 371,
      spriteHeight: 311,
      columns: 12,
      rows: 9,
      gapX: 2,
      gapY: 5,
      total: 108 // 表情数量
    }
  },
  methods: {
    // 核心计算
    calcBackgroundPosition(index) {
      const { columns, gapX, gapY, spriteWidth, spriteHeight, rows } = this;
      const singleWidth = (spriteWidth - gapX * (columns - 1)) / columns;
      const singleHeight = (spriteHeight - gapY * (rows - 1)) / rows;

      const col = index % columns;
      const row = Math.floor(index / columns);

      const offsetX = -(col * (singleWidth + gapX));
      const offsetY = -(row * (singleHeight + gapY));

      return {
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        width: singleWidth,
        height: singleHeight
      };
    },

    getStyle(index) {
      const pos = this.calcBackgroundPosition(index);
      return `
        display:inline-block;
        width:${pos.width}px;
        height:${pos.height}px;
        background:url(${this.spriteUrl}) no-repeat;
        background-size:${this.spriteWidth}px ${this.spriteHeight}px;
        background-position:${pos.backgroundPosition};
        vertical-align:middle;
      `;
    },

    onSelect(index) {
      this.onEmojiSelect && this.onEmojiSelect(index);
    }
  }
}
</script>

<style scoped>
.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  /* 你可以按需调 margin 实现表情间隔 */
}

.emoji-item {
  margin: 2px; /* 你可以把这个调成 0 看看是否留白更小 */
}
</style>

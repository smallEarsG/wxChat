<template>
  <scroll-view class="chat-toolbar" scroll-x  :show-scrollbar="false"  :style="{ fontSize: rpx(28) }">
  

    <view class="tool-item" @click="onClick({ label: '发起收款' })">
      <view class="icon-circle" :style="{width: rpx(34),height:rpx(34)}" >
        <image src="/static/chat/tool_1.png" class="tool-icon_pay" />
      </view>
      <text class="tool-label">发起收款</text>
    </view>

    <view class="tool-item" @click="onClick({ label: '客户转账' })">
      <view class="icon-circle"  :style="{width: rpx(34),height:rpx(34)}">
        <image src="/static/chat/tool_2.png" class="tool-icon" />
      </view>
      <text class="tool-label">客户转账</text>
    </view>

    <view class="tool-item" @click="onClick({ label: '快捷回复' })">
      <view class="icon-circle"  :style="{width: rpx(34),height:rpx(34)}">
        <image src="/static/chat/tool_3.png" class="tool-icon_reply" />
      </view>
      <text class="tool-label">快捷回复</text>
    </view>
	<view class="tool-item" @click="onClick({ label: '客户跟进' })">
	  <view class="icon-circle"  :style="{width: rpx(34),height:rpx(34)}" >
	    <image src="/static/chat/tool_5.png" class="tool-icon_follow" />
	  </view>
	  <text class="tool-label">推荐客服</text>
	</view>
	<view class="tool-item" @click="onClick({ label: '客户跟进' })">
	  <view class="icon-circle"  :style="{width: rpx(34),height:rpx(34)}">
	    <image src="/static/chat/tool_5.png" class="tool-icon_follow" />
	  </view>
	  <text class="tool-label">商品图册</text>
	</view>
	<view class="tool-item" @click="onClick({ label: '客户跟进' })">
	  <view class="icon-circle"  :style="{width: rpx(34),height:rpx(34)}">
	    <image src="/static/chat/tool_6.png" class="tool-icon_follow" />
	  </view>
	  <text class="tool-label">直播</text>
	</view>
	<view class="tool-item" @click="onClick({ label: '快捷回复' })">
	  <view class="icon-circle"  :style="{width: rpx(34),height:rpx(34)}">
	    <image src="/static/chat/tool_7.png" class="tool-icon_reply" />
	  </view>
	  <text class="tool-label">客户详情</text>
	</view>
  </scroll-view>
</template>

<script>
import scaleMixin from '@/mixins/scaleMixin.js'
import { setScale } from '@/utils/scale.js'
export default {
  mixins: [scaleMixin],
  name: 'ChatToolBar',
  methods: {
    onClick(item) {
      this.$emit('click', item);
    }
  }
};
</script>

<style scoped>
.chat-toolbar {
  /* width: 100%; */
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
  /* height: 70upx; */
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
  /* border-radius: 50%; */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5upx;
  padding:  4upx 0;
  /* background-color: aqua; */
  overflow: hidden;
}
.icon-circle image{
	width: 100%;
	height: 100%;
}

.tool-label {
  /* font-size: 28upx; */
  color: #333;
}
</style>

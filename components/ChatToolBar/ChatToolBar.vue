<template>
  <scroll-view class="chat-toolbar" scroll-x  :show-scrollbar="false">
  

    <view class="tool-item" @click="onClick({ label: '发起收款' })">
      <view class="icon-circle" >
        <image src="/static/chat/tool_1.png" class="tool-icon_pay" />
      </view>
      <text class="tool-label">发起收款</text>
    </view>

    <view class="tool-item" @click="onClick({ label: '客户转账' })">
      <view class="icon-circle" >
        <image src="/static/chat/tool_2.png" class="tool-icon" />
      </view>
      <text class="tool-label">客户转账</text>
    </view>

    <view class="tool-item" @click="onClick({ label: '快捷回复' })">
      <view class="icon-circle" >
        <image src="/static/chat/tool_3.png" class="tool-icon_reply" />
      </view>
      <text class="tool-label">快捷回复</text>
    </view>
	<view class="tool-item" @click="onClick({ label: '客户跟进' })">
	  <view class="icon-circle" >
	    <image src="/static/chat/tool_5.png" class="tool-icon_follow" />
	  </view>
	  <text class="tool-label">推荐客服</text>
	</view>
	<view class="tool-item" @click="onClick({ label: '客户跟进' })">
	  <view class="icon-circle" >
	    <image src="/static/chat/tool_5.png" class="tool-icon_follow" />
	  </view>
	  <text class="tool-label">商品图册</text>
	</view>
	<view class="tool-item" @click="onClick({ label: '客户跟进' })">
	  <view class="icon-circle" >
	    <image src="/static/chat/tool_6.png" class="tool-icon_follow" />
	  </view>
	  <text class="tool-label">直播</text>
	</view>
	<view class="tool-item" @click="onClick({ label: '快捷回复' })">
	  <view class="icon-circle" >
	    <image src="/static/chat/tool_7.png" class="tool-icon_reply" />
	  </view>
	  <text class="tool-label">客户详情</text>
	</view>
  </scroll-view>
</template>

<script>
export default {
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
  padding: 20rpx 10rpx;	
  background-color: #f5f5f5;
  padding-bottom: 0;
  text-align: center;
  align-self: center;
}
.chat-toolbar ::-webkit-scrollbar {
  display: none;
}
.tool-item {
  /* height: 70rpx; */
  display: inline-flex;
  align-items: center;
  background-color: #ffffff;
  padding: 8rpx 18rpx;
  border-radius: 40rpx;
  margin-left: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.icon-circle {
  width: 34rpx;
  height: 34rpx; 
  /* border-radius: 50%; */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5rpx;
  padding:  4rpx 0;
  /* background-color: aqua; */
  overflow: hidden;
}
.icon-circle image{
	width: 100%;
	height: 100%;
}
/* .tool-icon {
  margin: 6rpx 0;
  width: 30rpx;
  height: 30rpx;
}

.tool-icon_follow{
	width: 40rpx;
	height: 40rpx;
}
.tool-icon_pay{
	width: 40rpx;
	height: 40rpx;
}
.tool-icon_reply{
	width: 36rpx;
	height: 36rpx;
} */
.tool-label {
  font-size: 28rpx;
  color: #333;
}
</style>

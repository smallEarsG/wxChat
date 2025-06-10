<template>
  <view class="content-box" @click="handleClick">
    <!-- 消息头像区域 -->
    <view class="msg_img">
      <!-- 未读消息数标记 -->
      <view 
        class="msgIndex" 
        v-if="chatIndex > 0"
        :class="chatIndex > 100 ? 'more_red' : ''"
      >
        {{ chatIndex > 100 ? '99+' : chatIndex }}
      </view>
      <!-- 用户头像 -->
      <image 
        class="msg_avater" 
        :src="avatarUrl" 
        mode="aspectFill"
      ></image>
    </view>
    
    <!-- 消息信息区域 -->
    <view class="msg_info">
      <view class="msg_box">
        <!-- 消息顶部：名称、描述和时间 -->
        <view class="msg_top">
          <view class="msg_title">
            {{ name }} 
            <!-- <text class="title_desc">{{ description }}</text> -->
          </view>
          <view class="msg_time">{{ createdAt }}</view>
        </view>
        
        <!-- 消息内容描述 -->
        <view class="msg_desc">
          {{ formatMessage(content) }}
        </view>
      </view>
      
      <!-- 底部分割线 -->
      <view class="xline" style="position: absolute; bottom: 0;" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'ChatListItem',
  props: {
    // 必选参数：聊天项数据
    item: {
      type: Object,
      required: true
    },
    // 可选参数：是否禁用点击事件
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 计算属性：获取用户名
    name() {
      return this.item.name || '';
    },
    // 计算属性：获取用户头像
    avatarUrl() {
      return this.item.avatarUrl || '';
    },
    // 计算属性：获取未读消息数
    chatIndex() {
      return this.item.chatIndex || 0;
    },
    // 计算属性：获取描述信息
    description() {
      return this.item.description || '';
    },
    // 计算属性：获取创建时间
    createdAt() {
      return this.item.createdAt || '';
    },
    // 计算属性：获取消息内容
    content() {
      return this.item.content || '';
    }
  },
  methods: {
    // 处理消息内容格式化
    formatMessage(content) {
      // 这里可以实现你原来的msgDeal函数逻辑
     
      	let showText = '';
      	try {
      		// 解析JSON内容
      		const msgAry = JSON.parse(content);
      		console.log(msgAry);
      
      		// 从后向前遍历消息数组
      		for (let i = msgAry.length - 1; i >= 0; i--) {
      			const el = msgAry[i];
      
      			// 根据内容类型设置显示文本
      			switch (el.contentType) {
      				case 'chat':
      				 if( el.type !== 'tips'){
      					 showText = el.content;
      					}
      					
      					break;
      				case 'order':
      					showText = '[订单]';
      					break;
      				case 'crad': // 修正拼写错误
      					showText = '[名片]';
      					break;
      				case 'transfer':
      					showText = '[转账]';
      					break;
      				case 'photo':
      					showText = '[图片]';
      					break;
      				default:
      					// showText = `[未知类型:${el.contentType}]`;
      					console.log("图片");
      			}
      
      			// 只要找到任何一种有效类型就跳出循环
      			if (showText) break;
      		}
      	} catch (error) {
      		console.error('JSON解析错误:', error);
      		showText = '';
      	}
      	return showText;
     
    },
    // 处理点击事件
    handleClick() {
      // 如果组件被禁用，不执行点击事件
      if (this.disabled) return;
      
      // 触发点击事件，传递当前项数据
      this.$emit('click', this.item);
      
      // 如果你需要直接调用父组件的goChat方法
      // 可以这样做，但更推荐通过事件传递
      // this.goChat(this.item);
    },
    // // 保留接口，方便父组件调用
    // goChat(item) {
    //   this.$emit('goChat', item);
    // }
  }
}
</script>

<style scoped>

	.content-box {
		display: flex;
		/* background-color: #4475C9; */
		/* border: #4475C9 1px solid; */
		height: 152rpx;
	}
	.xline {
		width: 100%;
		height: 2rpx;
		background-color: #999;
		transform: scaleY(0.1);
		/* margin-bottom: 20rpx; */
	}
	.msg_img {
		position: relative;
		padding: 20rpx;
		padding-right: 10rpx;
		box-sizing: border-box;
		padding-left: 30rpx;
		/* display:flex;
		align-items: center;
		justify-content: center; */
	}

	.msgIndex {
		position: absolute;
		background-color: #ee4c25;
		z-index: 1;
		right: -14rpx;
		top: 12rpx;
		color: #fffffd;
		font-size: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 36rpx;
		width: 36rpx;
		overflow: hidden;
		border-radius: 50%;

	}

	.more_red {
		width: 50rpx !important;
		border-radius: 20rpx !important;
	}

	.msg_avater {
		width: 100rpx;
		height: 100rpx;
		border-radius: 20rpx;
	}

	.msg_info {
		padding: 0 20rpx;
		height: 100%;
		/* background-color: rebeccapurple; */
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
	}

	.msg_box {
		display: flex;
		flex-direction: column;
		/* align-items: center; */
		justify-content: center;
		width: 100%;
	}

	.msg_top {
		/* margin-top: 20rpx; */
		display: flex;
		justify-content: space-between;
		align-items: center;

	}

	.msg_title {
		font-size: 36rpx;
		/* display: flex; */
	}

	.title_desc {
		color: #4bc768;
		font-size: 30rpx;
		margin-left: 20rpx;
		/* display: block; */
		/* line-height: 30rpx; */
	}

	.msg_time {
		font-size: 24rpx;
		color: #cecfd1;
	}

	.msg_desc {
		margin: 10rpx 0;
		font-size: 24rpx;
		color: #9b9fa3;
		white-space: nowrap;
		/* 禁止换行 */
		overflow: hidden;
		/* 超出部分隐藏 */
		height: 30rpx;


	}
	</style>
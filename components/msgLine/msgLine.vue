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
          <!-- 如果最后一条消息是图片，显示图片缩略图 -->
          <view v-if="lastMessageType === 'photo' && lastImageUrl" class="image_preview_container">
            <image 
              :src="lastImageUrl" 
              class="image_preview" 
              mode="aspectFill"
            />
            <text class="image_text">[图片]</text>
          </view>
          <!-- 否则显示文字内容 -->
          <text v-else>{{ formatMessage(content) }}</text>
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
    },
    // 计算属性：检查最后一条消息类型
    lastMessageType() {
      try {
        const msgAry = JSON.parse(this.content);
        if (msgAry && msgAry.length > 0) {
          const lastMsg = msgAry[msgAry.length - 1];
          return lastMsg.contentType || '';
        }
      } catch (error) {
        console.error('解析消息内容失败:', error);
      }
      return '';
    },
    // 计算属性：获取最后一条消息的图片URL
    lastImageUrl() {
      try {
        const msgAry = JSON.parse(this.content);
        if (msgAry && msgAry.length > 0) {
          const lastMsg = msgAry[msgAry.length - 1];
          if (lastMsg.contentType === 'photo' && lastMsg.content) {
            // 根据不同的数据结构提取图片URL
            if (lastMsg.content.avatar) {
              return lastMsg.content.avatar;
            } else if (typeof lastMsg.content === 'string') {
              return lastMsg.content;
            } else if (lastMsg.content.url) {
              return lastMsg.content.url;
            }
          }
        }
      } catch (error) {
        console.error('解析图片URL失败:', error);
      }
      return '';
    }
  },
  methods: {
    // 处理消息内容格式化
    formatMessage(content) {
      // 如果最后一条消息是图片，在模板中已经单独处理了，这里返回空字符串
      if (this.lastMessageType === 'photo') {
        return '';
      }
      
      let showText = '';
      try {
        // 解析JSON内容
        const msgAry = JSON.parse(content);
        if (msgAry === null) {
          return "";
        }
        
        // 从后向前遍历消息数组
        for (let i = msgAry.length - 1; i >= 0; i--) {
          const el = msgAry[i];

          // 根据内容类型设置显示文本
          switch (el.contentType) {
            case 'chat':
              if (el.type !== 'tips') {
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
              // 图片在模板中单独处理，这里不处理
              break;
            default:
              // showText = `[未知类型:${el.contentType}]`;
              console.log("未知消息类型:", el.contentType);
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

	/* 图片预览容器 */
	.image_preview_container {
		display: flex;
		align-items: center;
		height: 30rpx;
	}

	/* 图片预览样式 */
	.image_preview {
		width: 30rpx;
		height: 30rpx;
		border-radius: 4rpx;
		margin-right: 8rpx;
		flex-shrink: 0;
	}

	/* 图片文字 */
	.image_text {
		font-size: 24rpx;
		color: #9b9fa3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	</style>
<template>
  <view class="wx-card" :style="cardScaleStyle">
    <view class="card-content">
      <view class="file-name">{{ content.fileName }}</view>
      <view class="avatar-box">
        <!-- 使用计算属性获取对应图标，减少重复代码 -->
        <image class="avatar" :src="getFileIcon()" />
      </view>
    </view>
    <view class="tag">{{ content.fileSize }}</view>
	<view  v-if="content.isCop">
		<view class="line"  />
		<view class="" style="font-size: 24rpx;display: flex;align-items: center;color:#aaa;">
			<image style="width: 34rpx;padding: 8rpx 0;margin-right: 8rpx;" src="/static/chat/login_guide_wework.png" mode="widthFix"></image> 企业微信电脑版
		</view>
	</view>
  </view>
</template>

<script>
export default {
  name: 'FileCard', // 修正组件名拼写错误
  props: {
	fontScale: {
	  type: Number,
	  default: 1
	},
    content: {
      type: Object,
      required: true, // 明确标记为必填属性
      default: () => ({}) // 确保默认值是安全的空对象
    }
  },
  computed: {
	cardScaleStyle() {
		const scale = Number(this.fontScale) || 1
		return {
			'padding-bottom': this.content.isCop ? '0rpx' : '30rpx',
			zoom: scale
		}
	}
  },
  methods: {
    // 集中管理文件类型与图标映射关系
    getFileIcon() {
      const iconMap = {
        '图片': '/static/qiw/fsi.png',    // 建议使用对应类型的图标
        '文档': '/static/qiw/ftt.png',
        'PDF': '/static/qiw/ft6.png',
        'EXCEL表格': '/static/qiw/fry.png'
        // 其他类型默认使用文件图标
      }
      return iconMap[this.content.fileType] || '/static/qiw/fs_.png'
    }
  }
}
</script>

<style scoped>
.line{
	width: 100%;
	height: 2rpx;
	margin-top: 12rpx;
	margin-bottom: 4rpx;
	transform: scaleY(0.1);
	background-color: #b4b4b4;
}
.wx-card {
  background: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  width: 460rpx;
  box-sizing: border-box;
  margin-left: 14rpx;
  display: flex;
  position: relative;
  flex-direction: column;

}

.card-content { /* 修正类名拼写错误cradContent -> card-content */
  display: flex;
  justify-content: space-between;
  align-items: center; /* 垂直居中对齐 */
}

.file-name { /* 统一使用kebab-case命名规范 */
  font-size: 32rpx;
  /* 可根据需要添加文本溢出处理 */
  /* max-width: 280rpx; */
  /* white-space: nowrap; */
  overflow: hidden;

}

.avatar-box {
  /* 移除冗余样式，保持结构清晰 */
}

.avatar {
  width: 84rpx;
  height: 84rpx;
  background: #d8eaff;
  border-radius: 8rpx;
  margin-left: 40rpx;
}

.tag {
  font-size: 24rpx;
  color: #aaa;
  align-self: flex-start; /* 与文件名左对齐 */
}
</style>

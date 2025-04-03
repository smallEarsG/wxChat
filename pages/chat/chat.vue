<template>
	<view class="chat-page">
		<!-- 顶部栏 -->
		<view class="nav-bar">
			<view class="back" @click="goBack">
				<image class="backimg" src="../../static/left.png"></image>
			</view>
			<view class="title">
				<view class="nikeName">
					<!-- {{guestInfo}} -->
					{{guestInfo.nickname || "企业微信工坊"}}
				</view>
				<view class="desc">{{guestInfo.description}}</view>
			</view>
			<view class="icons">
				<image class="nav-icon_phone" src="/static/icon-phone.png"></image>
				<image class="nav-icon_more" src="/static/icon-more.png"></image>
			</view>
		</view>

		<view class="chat-content">
			<!-- 聊天内容区域 -->
			<scroll-view class="chat-body" scroll-y  :show-scrollbar="false">
				<block v-for="(item ,i ) in massageList "  :key="i">
					<!-- 时间 -->
					<view v-if="item.type == 'tips'" class="msg-time">{{item.content}}</view>
					<view class="orderBox" v-else-if="item.contentType == 'order'">
						<view class="msg right" >
							<image class="avatar" src="/static/avatar-me.png" />
							<ExternalPayCard  :orderInfo="item.content"  />
						</view>
						
					</view>
					<block v-else>
						<!-- 聊天内容 -->
						<view class="msg left" v-if="item.location == 0">
							<image class="avatar" :src="guestInfo.avatar || '/static/avatar-other.png'" />
							<view class="bubble">
								<view v-if="item.contentType == 'chat'">
									{{item.content}}
								</view>
								
							</view>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" src="/static/avatar-me.png" />
							<view class="bubble">
								<view v-if="item.contentType == 'chat'">
									{{item.content}}
								</view>
							</view>
						</view>
					</block>
				</block>
				
			</scroll-view>


			<!-- 底部输入栏 -->
			<view class="fun_box">
				<ChatToolBar />
				<view class="chat-input">
					<image class="icon" src="/static/icon-voice.png"></image>
					<view class="input—box"><input class="input" placeholder="请输入" v-model="inputValue"
							@confirm="onEnterKey" /></view>
					<image class="icon" src="/static/icon-face.png"></image>
					<image class="icon_plus" src="/static/icon-plus.png" @click="togglePopupBox"></image>
				</view>
				<!-- 抽屉 -->
				<view class="popup_box" v-show="openPopup">
					<swiper class="drawer-swiper" indicator-dots circular>
						<swiper-item>
							<view class="feature-grid">
								<view>
									<switch :checked="isMe" @change="onSwitchChange" />{{isMe?"我":"客户"}}
									<view style="margin-top: 20rpx;">角色切换</view>
								</view>
							</view>
						</swiper-item>
						<swiper-item v-for="(page, i) in featurePages" :key="i">
							<view class="feature-grid">
								<view v-for="item in page" :key="item.name" class="feature-item"
									@click="onSelect(item.name)">
									<image class="feature-icon" :src="item.icon" />
									<text class="feature-text">{{ item.label }}</text>
								</view>
							</view>
						</swiper-item>

					</swiper>
				</view>
				<!-- 定义弹出层 -->
				<EditableFormPopup  ref="orderPopup" :value="orderInfo" :fieldLabels="orderKey" @submit="onOrderSubmit" />
				<EditableFormPopup  ref="timePopup" :value="timeInfo" :fieldLabels="timeKey" @submit="onTimeSubmit" />
			</view>
		</view>
	</view>
</template>

<script>
	import ExternalPayCard from '../../components/ExternalPayCard/ExternalPayCard.vue'; // 路径根据你存放的位置调整
	import EditableFormPopup from '../../components/EditableFormPopup/EditableFormPopup.vue';
	import ChatToolBar from '../../components/ChatToolBar/ChatToolBar.vue'
	export default {
		components: {
			ExternalPayCard,
			EditableFormPopup,
			ChatToolBar
		},
		onLoad(options) {
			console.log(options);
		  if (options.guestInfo) {
		    try {
		      this.guestInfo = JSON.parse(decodeURIComponent(options.guestInfo));
		    } catch (e) {
		      console.error('guestInfo 参数解析失败', e);
		    }
		  }
		},
		data() {
			return {
				guestInfo:{},
				isMe: false,
				openPopup: false,
				inputValue: "",
				featureList: [{
						name: 'order',
						label: '订单',
						icon: '/static/icon-order.png'
					},
					{
							name: 'time',
							label: '时间插入',
							icon: '/static/icon-time.png'
					},
					{
						name: 'photo',
						label: '照片',
						icon: '/static/icon-photo.png'
					},
					{
						name: 'camera',
						label: '拍摄',
						icon: '/static/icon-camera.png'
					},
					{
						name: 'file',
						label: '文件',
						icon: '/static/icon-file.png'
					},
					{
						name: 'contact',
						label: '名片',
						icon: '/static/icon-contacts.png'
					},
					{
						name: 'location',
						label: '位置',
						icon: '/static/icon-location.png'
					},
					{
						name: 'video',
						label: '视频通话',
						icon: '/static/icon-video.png'
					},
					// {
					// 	name: 'collection',
					// 	label: '收藏',
					// 	icon: '/static/icon-collection.png'
					// },
					// {
					// 	name: 'voice',
					// 	label: '语音输入',
					// 	icon: '/static/icon-voice.png'
					// },
					// {
					// 	name: 'todo',
					// 	label: '待办',
					// 	icon: '/static/icon-todo.png'
					// },
					// {
					// 	name: 'calendar',
					// 	label: '日程',
					// 	icon: '/static/icon-calendar.png'
					// }
				],
				massageList: [{
						type: "tips", // tips, content
						contentType: "chat", //order , chat ,link
						location: 0, // 1 表示我方
						content: "2024年12月24日 14:10",

					},
					{
						type: "content", // tips, content
						contentType: "chat", //order , chat ,link
						location: 0, // 1 表示我方
						content: "你好，欢迎来到企业微信工坊"

					},
					{
						type: "content", // tips, content
						contentType: "chat", //order , chat ,link
						location: 1, // 1 表示我方
						content: "你好，欢迎来到企业微信工坊"

					},
					{
						type: "tips", // tips, content
						contentType: "chat", //order , chat ,link
						location: 0, // 1 表示我方
						content: "2024年12月24日 14:10",

					},
					{
						type: "content", // tips, content
						contentType: "chat", //order , chat ,link
						location: 1, // 1 表示我方
						content: "你好，欢迎来到企业微信工坊,这里有订单,对外汇款等功能"

					}
				],
				orderInfo:{
					shopName:"",
					gusetName:"",
					price:""
				},
				orderKey:{
					shopName:"收款名称",
					gusetName:"付款人名称",
					price:"价格"
				},
				timeInfo:{
					time:""
				},
				timeKey:{
					time:"时间"
				}
				
			};
		},
		computed: {
			featurePages() {
				const pageSize = 8;
				const pages = [];
				for (let i = 0; i < this.featureList.length; i += pageSize) {
					pages.push(this.featureList.slice(i, i + pageSize));
				}
				return pages;
			}
		},
		methods: {
			onOrderSubmit(data){
				const location = this.isMe ? 1 : 0
				console.log(data);
				const orderInfo =  {
					type: "content", // tips, content
					contentType: "order", //order , chat ,link
					location, // 1 表示我方
					content: data
				}
				this.massageList.push(orderInfo)
			},
			onTimeSubmit(data){
				const location = this.isMe ? 1 : 0
				console.log(data);
				const timeInfo =  {
					type: "tips", // tips, content
					contentType: "chat", //order , chat ,link
					location, // 1 表示我方
					content: data.time
				}
				console.log(this.massageList);
				this.massageList.push(timeInfo)
			},
			goBack() {
				uni.navigateBack();
			},
			togglePopupBox() {
				this.openPopup = !this.openPopup;
			},
			onSwitchChange(e) {
				console.log(e);
				this.isMe = !this.isMe;
				console.log("当前开关状态：", this.isMe);
			},
			onSelect(type) {
				// 处理选择事件
				console.log('Selected:', type);
				// const key = type
				switch (type){
					case "order":
						this.$refs.orderPopup.open()
						break;
					case "time":
						this.$refs.timePopup.open()
						break;
					default:
					 uni.showToast({
					 	title: '功能开发中...',
						icon:'none'
					 })
						break;
				}
				
			},
			onEnterKey() {

				console.log(this.inputValue);
				if (this.inputValue.trim()) {
					console.log('用户输入内容:', this.inputValue);
					// 这里可以添加发送消息的逻辑
					const location = this.isMe ? 1 : 0
					this.massageList.push({
						type: "content",
						contentType: "chat",
						location,
						content: this.inputValue
					})
					// 清空输入框
					this.inputValue = '';
				}
			}
		}
	};
</script>

<style scoped>
	.chat-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #eaeaea;
		/* padding-top: 80rpx; */
	}

.chat-body ::-webkit-scrollbar {
  display: none;
}
	.chat-content {
		display: flex;
		flex-direction: column;
		/* background-color: red; */
		height: 100%;
		overflow: hidden;
	}

	.backimg {
		width: 50rpx;
		height: 50rpx;
	}

	/* 顶部栏 */
	.nav-bar {
		height: 80rpx;
		background-color: #3086ff;
		color: white;
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
		justify-content: space-between;
		box-sizing: content-box;
	}

	.title {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.desc {
		color: #e4eef0;
		font-size: 20rpx;
	}

	.nikeName {
		font-size: 34rpx;
		font-weight: bold;
	}

	.back {
		font-size: 32rpx;
	}

	.icons {
		display: flex;
		gap: 20rpx;
		align-items: center;
	}

	.nav-icon_more {
		width: 40rpx;
		height: 8rpx;
	}

	.nav-icon_phone {
		width: 40rpx;
		height: 40rpx;
	}

	/* 聊天内容 */
	.chat-body {
		flex: 1;
		padding: 10rpx 20rpx;
		/* 修正 padding 属性 */
		box-sizing: border-box;
		max-height: calc(100vh - 80rpx - 100rpx);
		/* 减去 nav-bar 和 chat-input 的高度 */
		overflow-y: auto;
	}

	.msg-time {
		text-align: center;
		color: #999;
		font-size: 24rpx;
		margin: 20rpx 0;
	}

	.msg {
		display: flex;
		margin-bottom: 20rpx;
	}

	.msg.left {
		flex-direction: row;
	}

	.msg.right {
		flex-direction: row-reverse;
	}

	.avatar {
		width: 70rpx;
		height: 70rpx;
		border-radius: 10rpx;
		margin: 0 10rpx;
	}

	.bubble {
		max-width: 480rpx;
		padding: 20rpx;
		font-size: 28rpx;
		border-radius: 16rpx;
		background-color: #ffffff;
		line-height: 1.5;
	}

	.msg.right .bubble {
		background-color: #9ed1ff;
	}

	/* 链接样式 */
	.link {
		color: #3086ff;
		margin-top: 10rpx;
		display: inline-block;
	}

	.fun_box {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		/* 防止收缩 */
		max-height: calc(100vh - 80rpx);
		/* 减去 nav-bar 的高度 */
	}

	/* 输入框 */
	.chat-input {
		height: 100rpx;
		background-color: #f5f5f5;
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
		gap: 20rpx;
		box-sizing: border-box;
	}

	.input {
		width: 100%;
		border-radius: 35rpx;
		height: 100%;
		font-size: 28rpx;
	}

	.input—box {
		flex: 1;
		height: 70rpx;
		background-color: white;
		padding: 0 20rpx;
	}

	.icon {
		width: 50rpx;
		height: 50rpx;
	}

	.icon_plus {
		width: 58rpx;
		height: 58rpx;
	}

	.drawer {
		background-color: #fff;

		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
		display: flex;
		justify-content: space-around;
		transition: height 0.3s ease;
		/* 添加过渡效果 */
	}

	.drawer-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx;
	}

	.drawer-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx;
	}

	.popup_box {
		background-color: #f9f9f9;
		padding: 20rpx 0;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
		transition: all 0.3s ease-in-out;
	}

	.drawer-swiper {
		height: 360rpx;
	}

	.feature-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		padding: 0 20rpx;
	}

	.feature-item {
		width: 25%;
		margin-top: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.feature-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx;
	}

	.feature-text {
		font-size: 24rpx;
		color: #333;
	}
</style>

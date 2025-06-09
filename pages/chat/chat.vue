<template>
	<!--  :style="{height:keyboardHeight?' 100vh':'calc(100vh - 514rpx) '}" -->
	<view class="chat-page" >
		<!-- 顶部栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack">
				<image class="backimg" src="../../static/left.png"></image>
			</view>
			<view class="title">
				<view class="nikeName">
					<!-- {{guestInfo}} -->
					{{guestInfo.name || "企业微信工坊"}}
				</view>
				<!-- <view class="desc">{{guestInfo.description}}</view> -->
				<view class="desc">@微信</view>
			</view>
			<view class="icons">
				<image class="nav-icon_phone" src="/static/icon-phone.png"></image>
				<image class="nav-icon_more" src="/static/icon-more.png"></image>
			</view>
		</view>

		<view class="chat-content">
		
		<view v-if="activeMsgIndex !== -1" class="overlay" @click="closePopupMenu"></view>
			<!-- 聊天内容区域 -->
			<scroll-view class="chat-body" scroll-y :show-scrollbar="false">
				<view v-for="(item ,i ) in massageList " :key="i">

					<!-- 时间 -->
					<view @longpress="showPopupMenu($event, i)" v-if="item.type == 'tips'" class="msg-time cell" >
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
					{{item.content}}
					</view>
					<view class="orderBox cell" @longpress="showPopupMenu($event, i)" v-else-if="item.contentType == 'order'" >
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						<view class="msg right">
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<ExternalPayCard :orderInfo="item.content" />
						</view>

					</view>
				<!-- 转账 -->
					<view  v-else-if="item.contentType == 'transfer'"  class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						<view class="msg left"  @longpress="showPopupMenu($event, i)" >
						<image class="avatar" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<TransferCard :name="item.content.name"  :amount="item.content.amount"></TransferCard>
						</view>
					</view>
				
					<!-- 图片photo -->
					
					<view  v-else-if="item.contentType == 'photo'" @longpress="showPopupMenu($event, i)"  class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						<view class="msg left" v-if="item.location == 0"  @longpress="showPopupMenu($event, i)">
							<image class="avatar" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<image  :src="item.content.avatar"class="phote leftp"  />
						</view>
						
						<view class="msg right"  @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<image :src="item.content.avatar" class="phote rightp" ></image>
						</view>
					</view>
						<!-- 名片 -->
					<view  v-else-if="item.contentType == 'crad'" @longpress="showPopupMenu($event, i)" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						<view class="msg left"   @longpress="showPopupMenu($event, i)">
							<image class="avatar" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<WxCard :nickname="item.content.nickname" :avatar="item.content.avatar"></WxCard>
						</view>
					</view>
					<!-- l、聊天 -->
					<view  v-else-if="item.contentType == 'chat'" @longpress="showPopupMenu($event, i)" class="cell">
						
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						<!-- 聊天内容 -->
						<view class="msg left"  @longpress="showPopupMenu($event, i)" v-if="item.location == 0">
							<image class="avatar" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<view class="bubble">
								<view >
									{{item.content}}
								</view>

							</view>
						</view>
				
						<view class="msg right"   @longpress="showPopupMenu($event, i)" v-else>
							
							
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble">
								<view >
									{{item.content}}
								</view>
							</view>
						</view>
					</view>
				</view>
				
			</scroll-view>

  <!-- :style="{paddingBottom:!keyboardHeight?' 300rpx':'0 '}" -->
			<!-- 底部输入栏 -->
			<view class="fun_box" >
				<ChatToolBar />
				<view class="chat-input">
					<image class="icon" src="/static/icon-voice.png"></image>
					<view class="input—box"><input class="input" placeholder="请输入" v-model="inputValue"
							@confirm="onEnterKey" /></view>
					<image class="icon_face"  v-if="keyboardHeight" src="/static/icon-face.png"></image>
					<image class="icon_plus" src="/static/icon-plus.png" @click="togglePopupBox"></image>
					<button class="send" @click="onEnterKey" v-if="!keyboardHeight"> 发送 </button>
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
				<EditableFormPopup ref="orderPopup" :value="orderInfo" :fieldLabels="orderKey"
					@submit="onOrderSubmit" />
				<EditableFormPopup ref="timePopup" :value="timeInfo" :fieldLabels="timeKey" @submit="onTimeSubmit" />
				<!-- 转账 -->
				<EditableFormPopup ref="transferPopup" :value="transfer" :fieldLabels="transferKey" @submit="onTransferSubmit" />
				<!-- 名片 -->
				<ProfileEditPopup ref="cradPopup"  @submit="onCradSubmitz"></ProfileEditPopup>
				<!-- <EditableFormPopup ref="cradPopup" :value="crad" :fieldLabels="cradKey" @submit="onCradSubmitz" /> -->
				<!-- 图片 -->
				<UploadImage ref="photoPopup"  @submit="onPhotoSubmit"></UploadImage>
			</view>
		</view>
	</view>
</template>

<script>
	import ExternalPayCard from '../../components/ExternalPayCard/ExternalPayCard.vue'; // 路径根据你存放的位置调整
	import EditableFormPopup from '../../components/EditableFormPopup/EditableFormPopup.vue';
	import ChatToolBar from '../../components/ChatToolBar/ChatToolBar.vue'
	import TransferCardVue from '../../components/TransferCard/TransferCard.vue';
	import UploadImage from '../../components/UploadImage/UploadImage.vue';
	import WxCard from '../../components/WxCard/WxCard.vue';
	import { getUserInfo } from '@/api/index.js'
	import {
				uploadImage,
				updateConversation
			} from '@/api/conversations.js'
	export default {
		components: {
			ExternalPayCard,
			EditableFormPopup,
			ChatToolBar,
			TransferCardVue,
			WxCard
		},
		onLoad(options) {

			if (options.guestInfo) {
				try {
					this.guestInfo = JSON.parse(decodeURIComponent(options.guestInfo));
					console.log(this.guestInfo);
					this.massageList = JSON.parse(this.guestInfo.content)
				} catch (e) {
					console.error('guestInfo 参数解析失败', e);
					this.massageList = []
				}
			}
			// 获取账号信息
			const userId = uni.getStorageSync('userId')
			console.log(userId);
			this.getUserInfo(userId)
			
			  uni.onKeyboardHeightChange(res => {
					if( res.height == 0)
			           {
						    this.keyboardHeight = true;
					   }
			          else
					    {
							this.keyboardHeight = false;
						}
			        });
					this.$forceUpdate()
		},
		data() {
			return {
				activeMsgIndex: -1, // 当前激活的消息索引
				keyboardHeight:true,
				userInfo:{},
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				guestInfo: {},
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
						name: 'transfer',
						label: '转账',
						icon: '/static/icon-transfer_black.png'
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
				massageList: [
					// {
					// 	type: "tips", // tips, content
					// 	contentType: "chat", //order , chat ,link
					// 	location: 0, // 1 表示我方
					// 	content: "2024年12月24日 14:10",

					// },
					// {
					// 	type: "content", // tips, content
					// 	contentType: "chat", //order , chat ,link
					// 	location: 0, // 1 表示我方
					// 	content: "你好，欢迎来到企业微信工坊"

					// },
					// {
					// 	type: "content", // tips, content
					// 	contentType: "chat", //order , chat ,link
					// 	location: 1, // 1 表示我方
					// 	content: "你好，欢迎来到企业微信工坊"

					// },
					// {
					// 	type: "tips", // tips, content
					// 	contentType: "chat", //order , chat ,link
					// 	location: 0, // 1 表示我方
					// 	content: "2024年12月24日 14:10",

											
					// },
					// {
					// 	type: "content", // tips, content
					// 	contentType: "crad", //order , chat ,link
					// 	location: 1, // 1 表示我方
					// 	content: {
					// 		name:"G",
							
					// 	}
					// }
				],
				orderInfo: {
					shopName: "",
					gusetName: "",
					price: ""
				},
				orderKey: {
					shopName: "收款名称",
					gusetName: "付款人名称",
					price: "价格"
				},
				timeInfo: {
					time: ""
				},
				timeKey: {
					time: "时间"
				},
				transfer:{
					name:"",
					amount:""
				},
				transferKey:{
					name:"用户名",
					amount:"转账金额"
				},
				crad:{
					name:"",
				},
				cradKey:{
					name:"用户名",
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
			updateMsg(){
				this.guestInfo.content = JSON.stringify(this.massageList)
				updateConversation(this.guestInfo.conversationId,this.guestInfo)
			},
			deleteMessage_1(index) {
				console.log(index);
				this.massageList.splice(index, 1);
				this.activeMsgIndex = -1; // 清除激活状态
			},
			showPopupMenu(e, index) {
				// console.log("====",index, e);
				this.activeMsgIndex = index;
			
				// 获取触摸坐标，适配弹出菜单位置
				const touch = e.touches?.[0] || {};
				// this.popupTop = 50 // touch.clientY - 100; // 往上偏移
				// this.popupLeft = 0  //touch.clientX - 50; // 居中偏移
			},
			closePopupMenu() {
				this.activeMsgIndex = -1;
			},
			async getUserInfo(userId) {
				console.log("执行用户信息获取",userId);
				const res = await getUserInfo(userId)
				console.log(res);
				this.userInfo = res.data

			},
			onCradSubmitz(data){
				console.log(11);
				const location = this.isMe ? 1 : 0
				const transferInfo = {
					type: "content", // tips, content
					contentType: "crad", //order , chat ,link
					location, // 1 表示我方
					content: data
				}
				console.log(data)
				this.massageList.push(transferInfo)
				this.updateMsg()
			},
			async onPhotoSubmit(data){
				console.log(data.avatar);
				const res = await uploadImage(data.avatar)
				
				const location = this.isMe ? 1 : 0;
				const photoInfo = {
					type: "content", // tips, content
					contentType: "photo", //order , chat ,link
					location, // 1 表示我方
					content: {avatar:res.data}
				};
				console.log(photoInfo);
				this.massageList.push(photoInfo);
				this.updateMsg()
			},
			onTransferSubmit(data){
				const location = this.isMe ? 1 : 0
				const transferInfo = {
					type: "content", // tips, content
					contentType: "transfer", //order , chat ,link
					location, // 1 表示我方
					content: data
				}
		
				this.massageList.push(transferInfo)
				this.updateMsg()
			},
		 	async onCradSubmit(data){
			console.log(data);
			const res = await uploadImage(data.avatar)
			const temp = data
			temp.avatar = res.data
			const location = this.isMe ? 1 : 0;
			const transferInfo = {
				type: "content", // tips, content
				contentType: "crad", //order , chat ,link
				location, // 1 表示我方
				content: temp
			};
			
			// console.log(data);
			this.massageList.push(transferInfo);
			this.updateMsg()
			},
			onOrderSubmit(data) {
				
				const location = this.isMe ? 1 : 0
				console.log(data);
				const orderInfo = {
					type: "content", // tips, content
					contentType: "order", //order , chat ,link
					location, // 1 表示我方
					content: data
				}
			
				this.massageList.push(orderInfo)
				this.updateMsg()
			},
			onTimeSubmit(data) {
				const location = this.isMe ? 1 : 0
				console.log(data);
				const timeInfo = {
					type: "tips", // tips, content
					contentType: "chat", //order , chat ,link
					location, // 1 表示我方
					content: data.time
				}
				console.log(this.massageList);
				this.massageList.push(timeInfo)
				this.updateMsg()
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
				switch (type) {
					case "order":
						this.$refs.orderPopup.open()
						break;
					case "time":
						this.$refs.timePopup.open()
						break;
					case "transfer":
						this.$refs.transferPopup.open()
						break;
					case "photo":	
						this.$refs.photoPopup.open()
						break;
					case "contact":
						this.$refs.cradPopup.open()
						break;
					default:
						uni.showToast({
							title: '请联系管理员开通',
							icon: 'none'
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
					this.updateMsg()
				}
			}
		}
	};
</script>

<style scoped>
	.send{
		background-color: blue;
		color: #fff;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 30rpx;
		text-align: center;
	}
	.cell{
		position: relative;
	}
	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
	}
	.popup-menu {
		position: absolute;
		background-color: #333;
		color: white;
		border-radius: 12rpx;
		padding: 10rpx 20rpx;
		z-index: 999;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		top: -60rpx;
		right: 50%;
	}
	
	.menu-item {
		padding: 10rpx 20rpx;
		font-size: 24rpx;
	}
	
	.chat-page {
		display: flex;
		flex-direction: column;
		/* height: calc(100vh - 514rpx); */
		height: 100vh;
		background-color: #eaeaea;
		overflow: hidden;
		/* position: absolute;
		width: 100%; */
		/* bottom: ; */
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
		/* padding-top: var(--status-bar-height); */
		height: 100rpx;
		background-color: #4475C9;
		color: white;
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
		justify-content: space-between;
		box-sizing: content-box;
		
		/* position: fixed; */
		/* width: 100%; */
		/* box-sizing: border-box; */
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
		font-weight: 600;
	}

	.back {
		font-size: 32rpx;
		margin-right: 60rpx;
	}

	.icons {
		display: flex;
		gap: 20rpx;
		align-items: center;
	}

	.nav-icon_more {
		width: 40rpx;
		height: 8rpx;
		margin-left: 20rpx;
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
		margin: 30rpx 0;
	}

	.msg {
		display: flex;
		margin-top: 34rpx;
	}

	.msg.left {
		flex-direction: row;
	}

	.msg.right {
		flex-direction: row-reverse;
	}

	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 10rpx;
		margin: 0 10rpx;
	}

	.bubble {
		max-width: 480rpx;
		padding: 20rpx 20rpx;
		font-size: 28rpx;
		border-radius: 16rpx;
		background-color: #ffffff;
		line-height: 1.5;
		position: relative;
		box-sizing: border-box;
	}

	.msg.right .bubble {
		background-color: #CDE5FD;
		margin-right: 14rpx;
	}

	.msg.left .bubble {
		margin-left: 14rpx;
	}

	.msg.right .bubble::after {
		content: "";
		position: absolute;
		top: 28rpx;
		right: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #CDE5FD;
	}

	.msg.left .bubble::after {
		content: "";
		position: absolute;
		top: 28rpx;
		left: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid white;
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
		margin-right: 20rpx;
	}

	.icon_face {
		width: 50rpx;
		height: 50rpx;
		margin-left: 20rpx;
	}

	.icon_plus {
		width: 58rpx;
		height: 58rpx;
		margin-left: 10rpx;
	}
	.phote{
		width: 200rpx;
		height: 200rpx;
		/* margin-left: 10rpx; */
		/* border-radius: 16rpx; */
		background-color: #3086ff;
	}
	.rightp{
		margin-right: 14rpx;
	}
	.leftp{
			margin-left: 14rpx;
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
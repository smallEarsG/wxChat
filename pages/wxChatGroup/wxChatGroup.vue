<template>
	<!-- :style="{bottom: '-'+chatInputBottom+'px'}" -->
	<view class="chat-page">

		<!-- 顶部栏 -->
		<view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="left" @click="goBack">
				<uni-icons type="left" size="25"></uni-icons>
			</view>
			<view class="title">{{guestInfo.nickname || "微信工坊"}}</view>
			<view class="right">
				<uni-icons type="more-filled" size="20"></uni-icons>
			</view>
		</view>
		<!-- 聊天内容区域 -->
		<view class="chat-content">
			<scroll-view class="chat-body" scroll-y :show-scrollbar="false">

				<view v-if="activeMsgIndex !== -1" class="overlay" @click="closePopupMenu"></view>
				<!-- 聊天内容 -->
				<view v-for="(item, i) in massageList" :key="i">
					<!-- 时间 -->
					<view v-if="item.type == 'tips'" class="msg-time cell" @longpress="showPopupMenu($event, i)">
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						{{item.content}}
					</view>
					<!-- <view class="orderBox" v-else-if="item.contentType == 'order'">
						<view class="msg right">
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<ExternalPayCard :orderInfo="item.content" @longpress="showPopupMenu($event, i)" />
						</view>
					</view> -->
					<!-- 名片 -->
					<view v-else-if="item.contentType == 'crad'" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						<view class="msg left"  @longpress="showPopupMenu($event, i)"  v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />
							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}}</view>
								<WxWxCard class="cardLeft" :nickname="item.content.nickname"
									:avatar="item.content.avatar" @longpress="showPopupMenu($event, i)"></WxWxCard>
							</view>
						</view>
						<view class="msg right"  @longpress="showPopupMenu($event, i)"  v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxWxCard class="cardRight" :nickname="item.content.nickname" :avatar="item.content.avatar"
								@longpress="showPopupMenu($event, i)"></WxWxCard>
						</view>
					</view>
					<!-- 图片photo -->
					<view v-else-if="item.contentType == 'photo'" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						<view class="msg left"  @longpress="showPopupMenu($event, i)"  v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />
							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}}</view>
								<image :src="item.content.avatar" class="phote leftp"
									@longpress="showPopupMenu($event, i)" />
							</view>
						</view>
						<view class="msg right"  @longpress="showPopupMenu($event, i)"  v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<image :src="item.content.avatar" class="phote rightp"
								@longpress="showPopupMenu($event, i)"></image>
						</view>
					</view>
					<!-- 转账 -->
					<view v-else-if="item.contentType == 'transfer'" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						<view class="msg left"  @longpress="showPopupMenu($event, i)" @click="resTransfer(i)" v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />
							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}}</view>
								<WxTransferCard :class="!item.content.st?'tfCardLeft':'tfCardLeftBg'"
									:state="item.content.st" :name="item.content.tip" :amount="item.content.amount">
								</WxTransferCard>
							</view>
						</view>
						<view class="msg right"  @longpress="showPopupMenu($event, i)"  @click="resTransfer(i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxTransferCard :class="!item.content.st?'tfCardRight':'tfCardRightBg'"
								:state="item.content.st" :name="item.content.tip" :amount="item.content.amount">
							</WxTransferCard>
						</view>
					</view>
					<!-- 收款 -->
					<view v-else-if="item.contentType == 'wxtf'" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						<view class="msg left"  @longpress="showPopupMenu($event, i)"  v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />
							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}}</view>
								<WxTf class="tfCardLeftBg" :name="item.content.tip" :amount="item.content.amount">
								</WxTf>
							</view>
						</view>
						<view class="msg right"  @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxTf class="tfCardRightBg" :name="item.content.tip" :amount="item.content.amount"></WxTf>
						</view>
					</view>
					<!-- 红包 -->
					<view v-else-if="item.contentType == 'redBag'" @click="getRB(i)" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						<view class="msg left"  @longpress="showPopupMenu($event, i)"  v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />
							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}}</view>
								<WxRedBag :class="item.content?'tfCardLeft':'tfCardLeftBg'" :state="item.content">
								</WxRedBag>
							</view>
						</view>
						<view class="msg right"  @longpress="showPopupMenu($event, i)"  v-else>

							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxRedBag :class="item.content?'tfCardRight':'tfCardRightBg'" :state="item.content">
							</WxRedBag>

						</view>
					</view>
					<view v-else-if="item.contentType == 'yuyin'" class="cell">

						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						<view class="msg left " @longpress="showPopupMenu($event, i)" v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />
							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}}</view>
								<view class="bubble">
									<view class="yuyinBox"
										:style="{ width: (114 + Math.floor((item.content.time - 1) / 2) * 10) + 'rpx' }">
										<image style="margin-right: 16rpx;" class="yuyinIcon"
											src="/static/images/wechat-voice-icon1.png"></image>
										{{item.content.time}}"
									</view>
								</view>
							</view>
						</view>
						<view class="msg right"  @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="msgContent">
								<view class="bubble">
									<view class="yuyinBox"
										:style="{ width: (114 + Math.floor((item.content.time - 1) / 2) * 10) + 'rpx' }"
										style="justify-content: flex-end;">
										{{item.content.time}}"
										<image style="margin-left: 16rpx;text-align: right;" class="yuyinIcon"
											src="/static/images/wechat-voice-icon2.png"></image>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view v-else-if="item.contentType == 'chat'" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu">
							<view class="menu-item" @click="deleteMessage_1(i)">删除</view>
						</view>
						<!-- 聊天内容 -->
						<view class="msg left " @longpress="showPopupMenu($event, i)" v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />

							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}}</view>
								<view class="bubble">
									<view v-if="item.contentType == 'chat'">
										{{item.content}}
									</view>
								</view>
							</view>
						</view>
						<view class="msg right"  @longpress="showPopupMenu($event, i)"  v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="msgContent">
								<view class="bubble">
									<view v-if="item.contentType == 'chat'">
										{{item.content}}
									</view>
								</view>
							</view>
						</view>
					</view>

				</view>
			</scroll-view>
		</view>

		<!-- 底部输入栏 -->
		<view class="fun_box">
			<!-- {{containerStyle.height}} -->
			<view class="chat-input">
				<image class="icon" src="/static/icon-voice.png" @click="addYuyin"></image>
				<view class="input—box"><input class="input" placeholder="请输入" v-model="inputValue"
						@confirm="onEnterKey" /></view>
				<image class="icon_face" src="/static/icon-face.png"></image>
				<image class="icon_plus" src="/static/icon-plus.png" @click="togglePopupBox"></image>
			</view>
			<!-- 抽屉 -->
			<view class="popup_box" v-show="openPopup">
				<swiper class="drawer-swiper" indicator-dots circular>
					<swiper-item>
						<view class="feature-grid">
							<view class="feature-item" v-for="(item,index) in gusetList" @click="changeRule(index)">
								<image class="feature-icon" :class="index == isMe?'boxsh':''" :src="item.url" />
								<text class="feature-text">{{item.text}} </text>
							</view>
							<view class="feature-item" @click="addGuset">
								<image class="feature-icon" src="/static/icon-plus.png" />
								<text class="feature-text">添加角色 </text>
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
		</view>
		<!-- 定义弹出层 -->
		<EditableFormPopup ref="timePopup" :value="timeInfo" :fieldLabels="timeKey" @submit="onTimeSubmit" />
		<!-- 转账 -->
		<EditableFormPopup ref="transferPopup" :value="transfer" :fieldLabels="transferKey"
			@submit="onTransferSubmit" />
		<!-- 图片 -->
		<UploadImage ref="photoPopup" @submit="onPhotoSubmit"></UploadImage>
		<!-- 名片 -->
		<ProfileEditPopup ref="cradPopup" @submit="onCradSubmitz"></ProfileEditPopup>
		<!-- yuyin -->
		<EditableFormPopup ref="yuyinPopup" :value="yuyinInfo" :fieldLabels="yuyinKey" @submit="onYuyinSubmit" />
		<ProfileEditPopup ref="wxChatAdd" @submit="addGusetInfo"></ProfileEditPopup>
	</view>
</template>

<script>
	import ExternalPayCard from '../../components/ExternalPayCard/ExternalPayCard.vue';
	import EditableFormPopup from '../../components/EditableFormPopup/EditableFormPopup.vue';
	import WxTransferCard from '../../components/WxTransferCard/WxTransferCard.vue';
	import {
		getUserInfo,
		login
	} from '@/api/index.js';

	export default {
		components: {
			ExternalPayCard,
			EditableFormPopup,
			WxTransferCard
		},
		onLoad(options) {
			if (options.guestInfo) {
				try {
					this.guestInfo = JSON.parse(decodeURIComponent(options.guestInfo));
				} catch (e) {
					console.error('guestInfo 参数解析失败', e);
				}
			}
			// 获取账号信息
			const userId = uni.getStorageSync('userId');
			console.log(userId);
			this.getUserInfo(userId);
			this.$forceUpdate();

		},
		data() {
			return {
				gusetList: [],
				activeMsgIndex: -1, // 当前激活的消息索引
				popupTop: 0,
				popupLeft: 0,
				userInfo: {},
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				chatInputBottom: 0,
				guestInfo: {},
				isMe: 0, // 1 表示为己方
				openPopup: false,
				inputValue: "",
				featureList: [{
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
					{
						name: 'redBag',
						label: '红包',
						icon: '/static/redBag.png'
					}
				],
				massageList: [
					//{
					// 		type: "tips", // tips, content
					// 		contentType: "chat", //order , chat ,link
					// 		location: 0, // 1 表示我方
					// 		content: "2024年12月24日 14:10"
					// 	},
					// 	{
					// 		type: "content", // tips, content
					// 		contentType: "chat", //order , chat ,link
					// 		location: 0, // 1 表示我方
					// 		content: "你好，欢迎来到企业微信工坊"
					// 	},
					// 	{
					// 		type: "content", // tips, content
					// 		contentType: "chat", //order , chat ,link
					// 		location: 1, // 1 表示我方
					// 		content: "你好，欢迎来到企业微信工坊"
					// 	},
					// 	{
					// 		type: "tips", // tips, content
					// 		contentType: "chat", //order , chat ,link
					// 		location: 0, // 1 表示我方
					// 		content: "2024年12月24日 14:10"
					// 	},
					// 	{
					// 		type: "content", // tips, content
					// 		contentType: "chat", //order , chat ,link
					// 		location: 1, // 1 表示我方
					// 		content: "你好，欢迎来到企业微信工坊,这里有订单,对外汇款等功能"
					// 	},
					// {
					// 	type: "content", // tips, content
					// 	contentType: "crad", //order , chat ,link
					// 	location: 1, // 1 表示我方
					// 	content: {
					// 		name: "G"
					// 	}
					// },{
					// 	type: "content", // tips, content
					// 	contentType: "crad", //order , chat ,link
					// 	location: 0, // 1 表示我方
					// 	content: {
					// 		name: "G"
					// 	}
					// },
					// {
					// 	type: "content", // tips, content
					// 	contentType: "redBag", //order , chat ,link
					// 	location: 0, // 1 表示我方
					// 	content:false
					// },
					// {
					// 	type: "content", // tips, content
					// 	contentType: "wxtf", //order , chat ,link
					// 	location: 1, // 1 表示我方
					// 	content:{
					// 		amount:"100",
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
				transfer: {
					// name:"",
					amount: ""
				},
				transferKey: {
					// name:"用户名",
					amount: "转账金额"
				},
				yuyinInfo: {
					time: ""
				},
				yuyinKey: {
					time: "时间长度"
				},
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
			},
			containerStyle() {
				return {
					height: `calc(100vh - ${this.chatInputBottom}px)`
				}
			}
		},
		mounted() {
			// this.$refs.chat_input.style.bottom = "282px"
			console.log(this.chatInputBottom);
			uni.onKeyboardHeightChange((res) => {
				if (res.height > 0) {
					this.chatInputBottom = res.height;
				} else {
					this.chatInputBottom = '0';
				}
			});
		},
		methods: {
			changeRule(i) {
				this.isMe = i
			},
			addGusetInfo(data) {
				console.log(data);
				this.gusetList.push({
					url: data.avatar,
					text: data.nickname
				})
			},
			addGuset() {
				this.$refs.wxChatAdd.open();
			},
			getRB(i) {
				console.log(this.massageList[i]);
				this.massageList[i].content = !this.massageList[i].content
				console.log(this.massageList[i]);
			},
			resTransfer(i) {
				if (this.massageList[i].content.st) return;
				const temp = JSON.parse(JSON.stringify(this.massageList[i]))
				this.massageList[i].content.st = true
				temp.contentType = 'wxtf'
				temp.location = this.isMe;
				this.massageList.push(temp)
				// 删掉 i 位置的数据 在 i这里插入两条
			},
			addYuyin() {
				this.$refs.yuyinPopup.open();
			},
			closePopupMenu() {
				this.activeMsgIndex = -1;
			},
			showPopupMenu(e, index) {
				// console.log("====",index, e);
				this.activeMsgIndex = index;

				// 获取触摸坐标，适配弹出菜单位置
				const touch = e.touches?. [0] || {};
				this.popupTop = 50 // touch.clientY - 100; // 往上偏移
				this.popupLeft = 0 //touch.clientX - 50; // 居中偏移
			},
			deleteMessage_1(index) {
				console.log(index);
				this.massageList.splice(index, 1);
				this.activeMsgIndex = -1; // 清除激活状态
			},
			onYuyinSubmit(data) {
				const location = this.isMe;
				const transferInfo = {
					type: "content", // tips, content
					contentType: "yuyin", //order , chat ,link
					location, // 1 表示我方
					content: {
						time: parseInt(data.time)
					}
				};
				console.log(data);
				this.massageList.push(transferInfo);
			},
			onCradSubmitz(data) {

				const location = this.isMe;
				const transferInfo = {
					type: "content", // tips, content
					contentType: "crad", //order , chat ,link
					location, // 1 表示我方
					content: data
				};
				console.log(data);
				this.massageList.push(transferInfo);
			},
			onPhotoSubmit(data) {
				console.log(data);
				const location = this.isMe;
				const photoInfo = {
					type: "content", // tips, content
					contentType: "photo", //order , chat ,link
					location, // 1 表示我方
					content: data
				};
				console.log(photoInfo);
				this.massageList.push(photoInfo);
			},
			onTransferSubmit(data) {
				const location = this.isMe;
				const transferInfo = {
					type: "content", // tips, content
					contentType: "transfer", //order , chat ,link
					location, // 1 表示我方
					content: {
						...data,
						tip: this.isMe ? "你发起了一笔转账" : "请收款"
					}
				};
				this.massageList.push(transferInfo);
			},
			async getUserInfo(userId) {
				console.log("执行用户信息获取", userId);
				const res = await getUserInfo(userId);
				console.log(res);
				this.userInfo = res.data;
				this.gusetList.push({
					url: 'http://106.15.137.235:8080/upload/' + res.data.avatar,
					text: '我'
				})
			},
			onOrderSubmit(data) {
				const location = this.isMe;
				console.log(data);
				const orderInfo = {
					type: "content", // tips, content
					contentType: "order", //order , chat ,link
					location, // 1 表示我方
					content: data
				};
				this.massageList.push(orderInfo);
			},
			onTimeSubmit(data) {
				const location = this.isMe;
				console.log(data);
				const timeInfo = {
					type: "tips", // tips, content
					contentType: "chat", //order , chat ,link
					location, // 1 表示我方
					content: data.time
				};
				console.log(this.massageList);
				this.massageList.push(timeInfo);
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
			addRedBag() {
				const location = this.isMe;

				const orderInfo = {
					type: "content", // tips, content
					contentType: "redBag", //order , chat ,link
					location, // 1 表示我方
					content: true
				};
				this.massageList.push(orderInfo);
			},
			onSelect(type) {
				// 处理选择事件
				console.log('Selected:', type);
				// const key = type
				switch (type) {
					case "order":
						this.$refs.orderPopup.open();
						break;
					case "time":
						this.$refs.timePopup.open();
						break;
					case "transfer":
						this.$refs.transferPopup.open();
						break;
					case "photo":
						this.$refs.photoPopup.open();
						break;
					case "contact":
						this.$refs.cradPopup.open();
						break;
					case "redBag":
						this.addRedBag()
						break
					default:
						uni.showToast({
							title: '功能开发中...',
							icon: 'none'
						});
						break;
				}
			},
			onEnterKey() {
				console.log(this.inputValue);
				if (this.inputValue.trim()) {
					console.log('用户输入内容:', this.inputValue);
					// 这里可以添加发送消息的逻辑
					const location = this.isMe;
					this.massageList.push({
						type: "content",
						contentType: "chat",
						location,
						content: this.inputValue
					});
					// 清空输入框
					this.inputValue = '';
				}
			}
		}
	};
</script>

<style scoped>
	.name {
		font-size: 22rpx;
		color: #aaa;
		padding-left: 10rpx;
		padding-bottom: 4rpx;
	}

	.boxsh {
		box-shadow: #3086ff 0rpx 0 10rpx 10rpx;
	}

	.cell {
		position: relative;
	}

	.yuyinBox {
		display: flex;
		align-items: center;
		max-width: 300rpx !important;
	}

	.yuyinIcon {
		width: 20rpx;
		height: 30rpx;
	}

	.tfCardLeftBg::after {
		content: "";
		position: absolute;
		top: 28rpx;
		left: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #fce1c3
	}

	.tfCardRightBg::after {
		content: "";
		position: absolute;
		top: 28rpx;
		right: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #fce1c3;
	}

	.tfCardRight::after {
		content: "";
		position: absolute;
		top: 28rpx;
		right: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #f99d3b;
	}

	.tfCardLeft::after {
		content: "";
		position: absolute;
		top: 28rpx;
		left: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #f99d3b;
	}

	.tfCardRightBg,
	.tfCardRight,
	.cardRight {
		margin-right: 14rpx;
	}

	.cardRight::after {
		content: "";
		position: absolute;
		top: 28rpx;
		right: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #fff;
	}

	.tfCardLeftBg,
	.tfCardLeft,
	.cardLeft {
		margin-left: 14rpx;
	}

	.cardLeft::after {
		content: "";
		position: absolute;
		top: 28rpx;
		left: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #fff;
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
		height: 100vh;
		background-color: #eaeaea;
		position: relative;
	}

	.chat-body ::-webkit-scrollbar {
		display: none;
	}

	.phote {
		width: 200rpx;
		height: 200rpx;
		background-color: #3086ff;
	}

	.rightp {
		margin-right: 14rpx;
	}

	.leftp {
		margin-left: 14rpx;
	}

	.chat-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
		padding-top: 4rpx;
		/* 为固定的头部留出空间 */
		padding-bottom: 20rpx;
		box-sizing: border-box;
	}

	.backimg {
		width: 50rpx;
		height: 50rpx;
	}

	/* 顶部栏 - 固定在顶部 */
	.custom-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100rpx;
		padding: 0 30rpx;
		border-bottom: 2rpx solid #e0e0e0;
		/*  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #eaeaea;
  z-index: 100;
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
		margin-right: 40rpx;
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

	/* 聊天内容 - 调整高度和位置 */
	.chat-body {
		flex: 1;
		padding: 10rpx 20rpx;
		box-sizing: border-box;
		max-height: calc(100vh - 100rpx - 100rpx);
		/* 减去头部和输入框的高度 */
		overflow-y: auto;
		position: relative;
		z-index: 1;
		transition: bottom 0.3s ease;
		/* 平滑过渡 */
	}

	.msg-time {
		text-align: center;
		color: #999;
		font-size: 24rpx;
		margin: 20rpx 0;
	}

	.msg {
		display: flex;
		margin-bottom: 25rpx;
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
		padding: 20rpx 25rpx;
		font-size: 30rpx;
		border-radius: 16rpx;
		background-color: #ffffff;
		line-height: 1.5;
		position: relative;
		box-sizing: border-box;
		/* min-width: 100rpx; */
		/* text-align: center; */
	}

	.msg.right .msgContent .bubble {
		background-color: #95ec69;
		margin-right: 14rpx;
	}

	.msg.left .msgContent .bubble {
		margin-left: 14rpx;
	}

	.msg.right .msgContent .bubble::after {
		content: "";
		position: absolute;
		top: 28rpx;
		right: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #95ec69;
	}

	.msg.left .msgContent .bubble::after {
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
		max-height: calc(100vh - 100rpx);
		/* 减去头部的高度 */
		position: relative;
		z-index: 50;
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
		/* position: fixed;
  bottom: 0;
  left: 0;
  right: 0; */
		/* top: 100rpx; */
		z-index: 1;
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

	.drawer {
		background-color: #fff;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
		display: flex;
		justify-content: space-around;
		transition: height 0.3s ease;
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
		/*  position: fixed;
  bottom: 100rpx; 
  left: 0;
  right: 0; */
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

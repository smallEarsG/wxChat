<template>
	<view class="chat-page">

	<view  v-if="!isIos" class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack">
				<image class="backimg" src="../../static/qiw/black_leftIcon.png"></image>
			</view>
			<view class="title">
				<view class="nikeName"  :style="{ fontSize: rpx(36) }">
					{{guestInfo.name || "企业微信工坊"}}
				</view>
				<!-- <view class="desc" :style="{ fontSize: rpx(24) }">{{guestInfo.description}}</view> -->

			</view>
			<view class="icons">
				<image @click="addVideo" class="nav-icon_phone" mode="widthFix" src="/static/icon-phone.png"></image>
				<image @click="openMenu" class="nav-icon_more" src="/static/qiw/more.png"></image>
			</view>
		</view>
		<!-- isIos -->
		<view  v-else class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack">
				<uni-icons type="left" color="#fff" size="24"></uni-icons>
				<view class="nav-icon_phone" style="margin-right: 46upx;" />
				
				<!-- <image class="backimg-ios" mode="widthFix" src="/static/left.png"></image> -->
			</view>
			<view class="title-ios">
				<view class="nikeName"  :style="{ fontSize: rpx(34),fontWeight:'500' }">
					{{guestInfo.name || "企业微信工坊"}}
				</view>
				<!-- <view class="desc" :style="{ fontSize: rpx(24) }">{{guestInfo.description}}</view> -->
			</view>
			<view class="icons">
				<image @click="addVideo" class="nav-icon_phone" mode="widthFix" src="/static/icon-phone.png"></image>
				<uni-icons type="more-filled" @click="openMenu" class="nav-icon_more-ios" color="#fff" size="24"></uni-icons>
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
						{{item.content}}
					</view>

					<!-- 名片 -->
					<view v-else-if="item.contentType == 'crad'" class="cell">

						<view class="msg left" @longpress="showPopupMenu($event, i)" v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />
							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}}</view>
								<WxCard class="cardLeft" :nickname="item.content.nickname"
									:avatar="item.content.avatar" @longpress="showPopupMenu($event, i)"></WxCard>
							</view>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxCard class="cardRight" :nickname="item.content.nickname" :avatar="item.content.avatar"
								@longpress="showPopupMenu($event, i)"></WxCard>
						</view>
					</view>
					<!-- 图片photo -->
					<view v-else-if="item.contentType == 'photo'" class="cell">
						<view class="msg left" @longpress="showPopupMenu($event, i)" v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />
							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}}</view>
								<image :src="item.content.avatar"  mode="widthFix" class="phote leftp"
									@longpress="showPopupMenu($event, i)" />
							</view>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<image :src="item.content.avatar" mode="widthFix" class="phote rightp"
								@longpress="showPopupMenu($event, i)"></image>
						</view>
					</view>
					<!-- 转账 -->
					<view v-else-if="item.contentType == 'transfer'" class="cell">

						<view class="msg left" @longpress="showPopupMenu($event, i)" @click="resTransfer(i)"
							v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />
							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}}</view>
								<TransferCard :class="!item.content.st?'tfCardLeft':'tfCardLeftBg'" :state="item.content.st"
									:name="item.content.name" :amount="item.content.amount"></TransferCard>
							</view>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" @click="resTransfer(i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<TransferCard :class="!item.content.st?'tfCardRight':'tfCardRightBg'"
								:state="item.content.st" :name="item.content.tip" :amount="item.content.amount">
							</TransferCard>
						</view>
					</view>
					<!-- 收款 -->
					<view v-else-if="item.contentType == 'wxtf'" class="cell">

						<view class="msg left" @longpress="showPopupMenu($event, i)" v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />
							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}}</view>
								<Tf class="tfCardLeftBg" :name="item.content.tip" :amount="item.content.amount">
								</Tf>
							</view>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<Tf class="tfCardRightBg" :name="item.content.tip" :amount="item.content.amount"></Tf>
						</view>
					</view>
					<!-- 红包 -->
					<view v-else-if="item.contentType == 'redBag'" @click="getRB(i)" class="cell">
						<view class="msg left" @longpress="showPopupMenu($event, i)" v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />
							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}}</view>
								<RedBag :class="item.content?'tfCardLeft':'tfCardLeftBg'" :state="item.content">
								</RedBag>
							</view>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>

							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<RedBag :class="item.content?'tfCardRight':'tfCardRightBg'" :state="item.content">
							</RedBag>

						</view>
					</view>
					<view v-else-if="item.contentType == 'yuyin'" class="cell">

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
						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>
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
		
						<view class="msg left " @longpress="showPopupMenu($event, i)" v-if="item.location !== 0">
							<image class="avatar" :src="gusetList[item.location].url" />

							<view class="msgContent">
								<view class="name">{{gusetList[item.location].text}} <text class="name-desc">{{gusetList[item.location].desc}}</text></view>
								<view class="bubble">
									<template v-for="(part, i) in parseMessage(item.content)">
										<text v-if="part.type === 'text'" :key="i">{{ part.content }}</text>
										<image v-else-if="part.type === 'emoji'" :key="i"
											:src="getEmojiUrl(part.index,item.location)" class="emoji-inline" />
									</template>
								</view>
							</view>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="msgContent">
								<view class="bubble">
									<template v-for="(part, i) in parseMessage(item.content)">
										<text v-if="part.type === 'text'" :key="i">{{ part.content }}</text>
										<image v-else-if="part.type === 'emoji'" :key="i"
											:src="getEmojiUrl(part.index,item.location)" class="emoji-inline" />
									</template>
								</view>
							</view>
						</view>
					</view>

				</view>
			</scroll-view>
			<!-- 底部输入栏 -->
			<view class="fun_box">
				<view class="chat-input" :style="{marginBottom: keyboardHeight+'px'}">
					<image class="icon" src="/static/icon-voice.png" @click="addYuyin"></image>
					<view class="input—box"><input class="input" :adjustPosition="false" placeholder="" v-model="inputValue"
							@confirm="onEnterKey" /></view>
					<image class="icon_face" v-if="!keyboard" src="/static/icon-face.png" @click="changeEmoji"></image>
					<image class="icon_plus" src="/static/icon-plus.png" @click="togglePopupBox"></image>
					<button class="send" @click="onEnterKey" v-if="keyboard"> 发送 </button>
				</view>
				<view class="emoji-picker" v-show="emoji">
					<view v-for="index in total" :key="index" class="emoji-item" @click="addEmojiToInput(index)">
						<image :src="getEmojiUrl(index)" class="emoji-img" />
					</view>
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
								<view v-for="item in page" :key="item.name" class="feature-item-fun"
									@click="onSelect(item.name)">
									<image class="feature-icon-fun" :src="item.icon" />
									<text class="feature-text">{{ item.label }}</text>
								</view>
							</view>
						</swiper-item>
					</swiper>
				</view>
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
		<!-- 插入 -->
		<EditableFormPopup ref="msgPopup" :value="editMsgInfo" :fieldLabels="editMsgKey" @submit="addMsgSubmit" />
		<!-- 编辑 -->
		<EditableFormPopup ref="editMsgPopup" :value="editMsgInfo" :fieldLabels="editMsgKey"
			@submit="onEditMsgSubmit" />
		<!-- yuyin -->
		<EditableFormPopup ref="yuyinPopup" :value="yuyinInfo" :fieldLabels="yuyinKey" @submit="onYuyinSubmit" />
		<ProfileEditPopup ref="wxChatAdd" @submit="addGusetInfo"></ProfileEditPopup>
	<uni-popup ref="rolePopup" class="role-popup">
	  <view class="role-container">
	    <view class="role-header">
	      <text>选择角色</text>
	    </view>
	    
	    <view class="role-list">
	      <view class="feature-item" 
	            v-for="(item, index) in gusetList" 
	            :key="index"
	            @click="changeMsgRule(index)"
	            :class="{'active': index == massageList[currentActionIndex].location}">
	        <image class="feature-icon" :src="item.url" />
	        <text class="feature-text">{{item.text}}</text>
	      </view>
	    </view>
	  </view>
	</uni-popup>
		<uni-popup ref="bottomPopup" background-color="#fff">
			<view class="popupbox">
				<view class="popup-handle"></view>
				<view class="grid-container">
					<view class="msgControlItem" @click="deleteMessage_1">
						<view class="icon-container bg-red-light">❌</view>
						<text class="action-text">删除</text>
					</view>

					<view class="msgControlItem" @click="insertTime">
						<view class="icon-container bg-blue-light">🕒</view>
						<text class="action-text">插入时间</text>
					</view>

					<view class="msgControlItem" @click="toggleRole">
						<view class="icon-container bg-purple-light">👤</view>
						<text class="action-text">切换角色</text>
					</view>

					<view class="msgControlItem" @click="addMsg">
						<view class="icon-container bg-green-light">➕</view>
						<text class="action-text">消息插入</text>
					</view>
					<view class="msgControlItem col-span-2" @click="changeMsg">
						<view class="icon-container bg-orange-light">✏️</view>
						<text class="action-text">消息编辑</text>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import ExternalPayCard from '../../components/ExternalPayCard/ExternalPayCard.vue';
	import EditableFormPopup from '../../components/EditableFormPopup/EditableFormPopup.vue';
	import TransferCardVue from '../../components/TransferCard/TransferCard.vue';
	import scaleMixin from '@/mixins/scaleMixin.js'
	import {
		getUserInfo,
		login
	} from '@/api/index.js';

	export default {
		mixins: [scaleMixin],
		components: {
			ExternalPayCard,
			EditableFormPopup,
			TransferCardVue
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
				keyboardHeight: 0,
				keyboard: false,
				gusetList: [],
				activeMsgIndex: -1, // 当前激活的消息索引				
				userInfo: {},

				chatInputBottom: 0,
				guestInfo: {},
				isMe: 0, // 1 表示为己方
				openPopup: false,
				inputValue: "",
				massageList: [
					{
					 type: "content", // tips, content
					contentType: "chat", //order , chat ,link
					location:0, // 1 表示我方
					content: "0000",
					}
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
		},
		mounted() {

			this.isIos = uni.getSystemInfoSync().platform === 'ios'
			if (!this.isIos) {
				this.keyboardHeight = 10
			}
			uni.onKeyboardHeightChange(res => {
				if (res.height == 0) {
					// console.log();)
					this.keyboardHeight = this.isIos ? 0 : 10;
				} else {
					this.emoji = false
					this.openPopup = false
					const safeAreaBottom = this.getSafeAreaInsetBottom();
					this.keyboardHeight = res.height - safeAreaBottom;
				}
			});
			// setTimeout(() => {
			// 	this.$refs.bottomPopup.open("bottom")
			// }, 1000)
		},
		methods: {
			getEmojiUrl(index, location = 1) {
				return location != 0 ? `/static/emoji/emoji_${index}.png` : `/static/emoji/emoji_${index}_blue.png`;
			},
			toggleRole() {
				this.currentActionIndex = this.activeMsgIndex;
				this.$refs.bottomPopup.close()
				this.$refs.rolePopup.open("bottom")
				this.activeMsgIndex = -1;
			},
			getSafeAreaInsetBottom() {
				const systemInfo = uni.getSystemInfoSync();

				// iOS 设备且有安全区域信息
				if (systemInfo.platform === 'ios' && systemInfo.safeArea) {
					return systemInfo.screenHeight - systemInfo.safeArea.bottom;
				}

				// Android 设备通常没有安全区域问题，返回 0
				return 0;
			},
			changeRule(i) {
				this.isMe = i
			},
			changeMsgRule(i){
				this.massageList[this.currentActionIndex].location = i
			},
			addGusetInfo(data) {
				console.log(data);
				this.gusetList.push({
					url: data.avatar,
					text: data.nickname,
					desc:data.description
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

				this.activeMsgIndex = index;
				this.$refs.bottomPopup.open("bottom")
			},
			deleteMessage_1() {
				this.massageList.splice(this.activeMsgIndex, 1);
				this.activeMsgIndex = -1; // 清除激活状态
				this.$refs.bottomPopup.close()
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
				const timeInfo = {
					type: "tips",
					contentType: "chat",
					content: data.time
				}

				// 如果有当前操作的索引，将时间插入到该消息上方
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, timeInfo);
					// 插入后重置索引
					this.currentActionIndex = -1;
				} else {
					// 否则默认添加到末尾
					this.massageList.push(timeInfo);
				}

				this.updateMsg()
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
				this.addMsgcomm(this.inputValue)
				
			},
			addMsgcomm(inputValue) {
				if (inputValue.trim()) {
					console.log('用户输入内容:', inputValue);
					// 这里可以添加发送消息的逻辑
					const location = this.isMe;
					const msgInfo = {
						type: "content",
						contentType: "chat",
						location,
						content: inputValue
					}

					// 如果有当前操作的索引，将时间插入到该消息上方
					if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
						this.massageList.splice(this.currentActionIndex, 0, msgInfo);
						// 插入后重置索引
						this.currentActionIndex = -1;
					} else {
						// 否则默认添加到末尾
						this.massageList.push(msgInfo);
					}
					// 清空输入框
					 this.inputValue = ''
					// this.updateMsg()
				}
			},

		}
	};
</script>

<style scoped>
	/* 弹窗整体样式 */
	.role-popup {
	  background-color: rgba(0,0,0,0.5);
	}
	
	.role-container {
	  background-color: white;
	  border-radius: 32upx;
	  box-shadow: 0 10upx 50upx rgba(0,0,0,0.15);
	  margin: 0 24upx;
	  overflow: hidden;
	  transform: translateY(20%);
	  padding-bottom: 80upx;
	}
	
	/* 头部样式 */
	.role-header {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  padding: 16upx 0;
	  border-bottom: 2upx solid #f0f0f0;
	}
	
	.role-header text {
	  font-size: 32upx;
	  font-weight: 500;
	  color: #333;
	}
	
	/* 角色列表样式 */
	.role-list {
	  display: grid;
	  grid-template-columns: repeat(3, 1fr);
	  gap: 12upx;
	  padding: 16upx;
	  max-height: 70vh;
	  overflow-y: auto;
	}
	
	/* 单个角色项样式 */
	.feature-item {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  padding: 12upx;
	  border-radius: 20upx;
	  transition: all 0.2s ease;
	  cursor: pointer;
	}
	
	.feature-item.active {
	  background-color: rgba(22, 93, 255, 0.1);
	  border: 2upx solid #165DFF;
	}
	
	/* 角色图标样式 */
	.feature-icon {
	  width: 128upx;
	  height: 128upx;
	  object-fit: cover;
	  border-radius: 50%;
	  box-shadow: 0 4upx 12upx rgba(0,0,0,0.08);
	  transition: transform 0.2s ease;
	}
	.feature-icon-fun {
	  width: 80upx;
	  height: 80upx;
	  object-fit: cover;
	  /* border-radius: 50%; */
	  /* box-shadow: 0 4upx 12upx rgba(0,0,0,0.08); */
	  transition: transform 0.2s ease;
	}
	
	.feature-item.active .feature-icon {
	  border: 4upx solid #165DFF;
	  transform: scale(1.05);
	}
	
	/* 角色文字样式 */
	.feature-text {
	  margin-top: 8upx;
	  font-size: 24upx;
	  text-align: center;
	  color: #666;
	  transition: color 0.2s ease;
	}
	
	.feature-item.active .feature-text {
	  color: #165DFF;
	  font-weight: 500;
	}
	/* 全局样式 */
	:root {
		--color-red: #ef4444;
		--color-blue: #3b82f6;
		--color-purple: #8b5cf6;
		--color-green: #22c55e;
		--color-orange: #f97316;

		--color-red-light: #fee2e2;
		--color-blue-light: #dbeafe;
		--color-purple-light: #ede9fe;
		--color-green-light: #dcfce7;
		--color-orange-light: #fff7ed;

		--text-color: #4b5563;
		--border-color: #e5e7eb;
		--hover-bg: #f3f4f6;
	}

	/* 弹窗样式 */
	.custom-popup {
		background-color: rgba(0, 0, 0, 0.3);
		border-radius: 32upx 32upx 0 0;
		overflow: hidden;
	}

	.popupbox {
		background-color: white;
		border-radius: 32upx 32upx 0 0;
		box-shadow: 0 -8upx 40upx rgba(0, 0, 0, 0.1);
	}

	.popup-handle {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 24upx 0;
		border-bottom: 2upx solid var(--border-color);
	}

	.popup-handle::before {
		content: '';
		width: 128upx;
		height: 8upx;
		background-color: #d1d5db;
		border-radius: 9999upx;
	}

	/* 网格布局 */
	.grid-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16upx;
		padding: 32upx;
	}

	.col-span-2 {
		grid-column: span 2;
	}

	/* 控制项样式 */
	.msgControlItem {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 24upx;
		border-radius: 24upx;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.msgControlItem:hover {
		background-color: var(--hover-bg);
	}

	.icon-container {
		width: 96upx;
		height: 96upx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16upx;
		font-size: 36upx;
	}

	.bg-red-light {
		background-color: var(--color-red-light);
		color: var(--color-red);
	}

	.bg-blue-light {
		background-color: var(--color-blue-light);
		color: var(--color-blue);
	}

	.bg-purple-light {
		background-color: var(--color-purple-light);
		color: var(--color-purple);
	}

	.bg-green-light {
		background-color: var(--color-green-light);
		color: var(--color-green);
	}

	.bg-orange-light {
		background-color: var(--color-orange-light);
		color: var(--color-orange);
	}

	.action-text {
		color: var(--text-color);
		font-size: 28upx;
	}

	.msgControlItem {
		margin-bottom: 10upx;
	}

	.emoji-inline {
		width: 40upx;
		height: 40upx;
		vertical-align: middle;
		margin: 0 1px;
		position: relative;
		top: -6upx;

	}

	.emoji-picker {
		background-color: #fff;
		height: 360upx;
		overflow: auto;
		display: flex;
		flex-wrap: wrap;
		padding: 5px;
	}

	.emoji-item {
		width: 80upx;
		height: 76upx;
		margin: 18upx;
		overflow: hidden;
	}

	.emoji-img {
		width: 32px;
		height: 32px;
	}

	.popupbox {
		padding: 40upx;
		box-sizing: border-box;
	}

	.send {
		background-color: green;
		color: #fff;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 30rpx;
		text-align: center;
	}

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
	.nav-bar {
	
		height: 100upx;
		background-color: #4475C9;
		color: white;
		display: flex;
		align-items: center;
		padding: 10upx 20upx;
		justify-content: space-between;
		box-sizing: content-box;
	
	}
	
	.title {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		flex: 1;
	
		justify-content: center;
	}
	.title-ios{
		display: flex;
		flex-direction: column;
		justify-content: center;
		
		align-items: center;
		
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
		max-width: 440upx;
		width: 240upx;
		height: auto;
		/* height: 200rpx; */
		/* background-color: #3086ff; */
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
		/* padding-bottom: 20rpx; */
		box-sizing: border-box;
	}

	.backimg {
		width: 44rpx;
		height: 48rpx;
	}

	/* 顶部栏 - 固定在顶部 */



	.desc {
		color: #e4eef0;
		font-size: 24rpx;
	}

	.nikeName {
		font-size: 34rpx;
		font-weight: 600;
	}

	.back {
		font-size: 32upx;
		margin-right: 32upx;
		display: flex;
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
.nav-icon_more {
		width: 40upx;
		height: 40upx;
		margin-left: 30upx;
	}
	.nav-icon_more-ios{
		margin-left: 30upx;
		margin-right: 16upx;
		/* width: 40upx; */
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
		font-size: 32rpx;
		border-radius: 16rpx;
		background-color: #ffffff;
		line-height: 1.3;
		position: relative;

		box-sizing: border-box;
		/* min-width: 100rpx; */
		/* text-align: center; */
	}

	.msg.right .msgContent .bubble {
		background-color: #CDE5FD;
		margin-right: 14rpx;
	}

	.msg.left .msgContent .bubble {
		margin-left: 14rpx;
	}
	.msg.left .msgContent {
		 display: flex;
		  flex-direction: column;
		  align-items: flex-start;
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
		border-left: 6px solid #CDE5FD;
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
	.name-desc{
		color: #4bc768;
		font-size: 22rpx;
		margin-left: 6rpx;
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
		/* padding-bottom: 20rpx; */
		background-color: #f5f5f5;
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
		/* width: 25%; */
		margin-top: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.feature-item-fun{
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
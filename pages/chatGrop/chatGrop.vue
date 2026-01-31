<template>
	<view class="chat-page">
		<!-- 全局水印层 -->
		<WatermarkLayer />

	<view  v-if="!isIos" class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack">
				<image class="backimg" src="../../static/qiw/black_leftIcon.png" mode="widthFix"></image>
			</view>
			<view class="title">
				<view class="nikeName"  :style="{ fontSize: rpx(36) }">
					{{guestInfo.nickname || "微信工坊"}}
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
				<uni-icons type="left" color="#000" size="24"></uni-icons>
				<view class="nav-icon_phone" style="margin-right: 26upx;" />
			</view>
			<view class="title-ios">
				<view class="nikeName"  :style="{ fontSize: rpx(34),fontWeight:'500' }">
					{{guestInfo.nickname || "微信工坊"}}
				</view>
				<!-- <view class="desc" :style="{ fontSize: rpx(24) }">{{guestInfo.description}}</view> -->
			</view>
			<view class="icons">
				<image @click="addVideo" class="nav-icon_phone" mode="widthFix" src="/static/icon-phone.png"></image>
				<uni-icons style="margin-left: 20rpx;" type="more-filled" size="24"></uni-icons>
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
							<image class="avatar" :src="getRoleInfo(item.location).url" />
							<view class="msgContent">
								<view class="name">{{getRoleInfo(item.location).text}}</view>
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
							<image class="avatar" :src="getRoleInfo(item.location).url" />
							<view class="msgContent">
								<view class="name">{{getRoleInfo(item.location).text}}</view>
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
							<image class="avatar" :src="getRoleInfo(item.location).url" />
							<view class="msgContent">
								<view class="name">{{getRoleInfo(item.location).text}}</view>
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
							<image class="avatar" :src="getRoleInfo(item.location).url" />
							<view class="msgContent">
								<view class="name">{{getRoleInfo(item.location).text}}</view>
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
							<image class="avatar" :src="getRoleInfo(item.location).url" />
							<view class="msgContent">
								<view class="name">{{getRoleInfo(item.location).text}}</view>
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
							<image class="avatar" :src="getRoleInfo(item.location).url" />
							<view class="msgContent">
								<view class="name">{{getRoleInfo(item.location).text}}</view>
								<view class="bubble">
									<view class="yuyinBox"
										:style="{ width: (114 + Math.floor((item.content.time - 1) / 2) * 10) + 'rpx' }">
										<image style="margin-right: 16rpx;" class="yuyinIcon"
											src="/static/images/yuyin_00 .png"></image>
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
											src="/static/yuyin_1.png"></image>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view v-else-if="item.contentType == 'chat'" class="cell">
		
						<view class="msg left " @longpress="showPopupMenu($event, i)" v-if="item.location !== 0">
							<image class="avatar" :src="getRoleInfo(item.location).url" />

							<view class="msgContent">
								<view class="name">{{getRoleInfo(item.location).text}} <text class="name-desc">{{getRoleInfo(item.location).desc}}</text></view>
							<view class="bubble">
								<template v-for="(part, partIndex) in parseMessage(item.content)">
									<text v-if="part.type === 'text'" :key="'text-'+partIndex">{{ part.content }}</text>
									<image v-else-if="part.type === 'emoji'" :key="'emoji-'+partIndex"
										:src="getEmojiUrl(part.index,item.location)" class="emoji-inline" />
								</template>
							</view>
						</view>
					</view>
					<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>
						<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
						<view class="msgContent">
							<view class="bubble">
								<template v-for="(part, partIndex) in parseMessage(item.content)">
									<text v-if="part.type === 'text'" :key="'text-'+partIndex">{{ part.content }}</text>
									<image v-else-if="part.type === 'emoji'" :key="'emoji-'+partIndex"
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
					<FeaturePanel
						:guest-list="guestList"
						:feature-pages="featurePages"
						:current-role-index="currentRoleIndex"
						@change-role="changeRule"
						@add-role="addGuset"
						@edit-role="handleEditRole"
						@delete-role="handleDeleteRole"
						@select-feature="onSelect"
					/>
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
		<!-- 编辑角色 -->
		<ProfileEditPopup ref="editRolePopup" :value="editRoleInfo" @submit="onEditRoleSubmit"></ProfileEditPopup>
	<uni-popup ref="rolePopup" class="role-popup">
	  <view class="role-container">
	    <view class="role-header">
	      <text>选择角色</text>
	    </view>
	    
	    <view class="role-list">
	      <view class="feature-item" 
	            v-for="(item, index) in guestList" 
	            :key="item.id || index"
	            @click="changeMsgRule(index)"
	            :class="{'active': checkSelect(index)}">
	        <image class="feature-icon" :src="item.url || '/static/default-avatar.png'" />
	        <text class="feature-text">{{item.text || '未命名'}}</text>
	      </view>
	    </view>
	  </view>
	</uni-popup>
		<!-- 悬浮菜单 -->
		<view 
			v-if="activeMsgIndex !== -1 && popupMenuPosition.show" 
			class="floating-menu"
			:style="{
				top: popupMenuPosition.top + 'px',
				left: popupMenuPosition.left + 'px'
			}"
		>
			<view class="floating-menu-content">
				<view class="floating-menu-item" @click="deleteMessage_1">
					<view class="floating-icon bg-red-light">❌</view>
					<text class="floating-text">删除</text>
				</view>

				<view class="floating-menu-item" @click="insertTime">
					<view class="floating-icon bg-blue-light">🕒</view>
					<text class="floating-text">时间</text>
				</view>

				<view class="floating-menu-item" @click="toggleRole">
					<view class="floating-icon bg-purple-light">👤</view>
					<text class="floating-text">角色</text>
				</view>

				<view class="floating-menu-item" @click="addMsg">
					<view class="floating-icon bg-green-light">➕</view>
					<text class="floating-text">插入</text>
				</view>

				<view class="floating-menu-item" @click="changeMsg">
					<view class="floating-icon bg-orange-light">✏️</view>
					<text class="floating-text">编辑</text>
				</view>

				<view class="floating-menu-item" @click="insertRedBag">
					<view class="floating-icon bg-red-light">🧧</view>
					<text class="floating-text">红包</text>
				</view>

				<view class="floating-menu-item" @click="insertTransfer">
					<view class="floating-icon bg-blue-light">💰</view>
					<text class="floating-text">转账</text>
				</view>

				<view class="floating-menu-item" @click="insertPhoto">
					<view class="floating-icon bg-green-light">📷</view>
					<text class="floating-text">图片</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import ExternalPayCard from '../../components/ExternalPayCard/ExternalPayCard.vue';
	import EditableFormPopup from '../../components/EditableFormPopup/EditableFormPopup.vue';
	import TransferCardVue from '../../components/TransferCard/TransferCard.vue';
	import FeaturePanel from '../../components/FeaturePanel/FeaturePanel.vue';
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
			TransferCardVue,
			FeaturePanel
		},
		onLoad(options) {
			if (options.guestInfo) {
				try {
					this.guestInfo = JSON.parse(decodeURIComponent(options.guestInfo));
				} catch (e) {
					console.error('guestInfo 参数解析失败', e);
				}
			}
			
			// 恢复缓存数据
			this.loadChatData();
			
			// 获取账号信息
			const userId = uni.getStorageSync('userId');
			console.log(userId);
			this.getUserInfo(userId);
			this.$forceUpdate();
		},
		onUnload() {
			// 页面卸载时保存数据
			this.saveChatData();
		},
		data() {
			return {
				keyboardHeight: 0,
				keyboard: false,
				guestList: [], // 修复拼写：gusetList -> guestList
				activeMsgIndex: -1, // 当前激活的消息索引				
				userInfo: {},

				chatInputBottom: 0,
				guestInfo: {},
				currentRoleIndex: 0, // 重命名：isMe -> currentRoleIndex，当前选中的角色索引
			openPopup: false,
			inputValue: "",
			popupMenuPosition: {
				show: false,
				top: 0,
				left: 0
			},
			massageList: [
					// {
					//  type: "content", // tips, content
					// contentType: "chat", //order , chat ,link
					// location:0, // 1 表示我方
					// content: "0000",
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
			editRoleInfo: {
				nickname: '',
				avatar: '',
				description: ''
			},
			editingRoleIndex: null, // 当前正在编辑的角色索引
			editMsgInfo: {
				content: ''
			},
			editMsgKey: {
				content: '消息内容'
			},
			currentActionIndex: -1, // 当前操作的消息索引（用于编辑和插入）
			timeInfo: {
				time: ""
			},
			timeKey: {
				time: "时间"
			},
		};
		},
		watch: {
			massageList: {
				handler() {
					this.saveChatData();
				},
				deep: true
			},
			guestList: {
				handler() {
					this.saveChatData();
				},
				deep: true
			},
			currentRoleIndex() {
				this.saveChatData();
			}
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
			// 获取角色信息（带边界检查）
			getRoleInfo(location) {
				if (location < 0 || location >= this.guestList.length) {
					console.warn('角色索引超出范围:', location);
					return {
						url: '/static/default-avatar.png',
						text: '未知角色',
						id: null
					};
				}
				return this.guestList[location] || {
					url: '/static/default-avatar.png',
					text: '未知角色',
					id: null
				};
			},
			
		// 解析消息内容（支持表情）
		parseMessage(content) {
			if (typeof content !== 'string') {
				return [{ type: 'text', content: String(content) }];
			}
			const parts = [];
			const emojiRegex = /\[(\d+)\]/g;
			let lastIndex = 0;
			let match;
			
			while ((match = emojiRegex.exec(content)) !== null) {
				// 添加表情前的文本
				if (match.index > lastIndex) {
					parts.push({
						type: 'text',
						content: content.substring(lastIndex, match.index)
					});
				}
				// 添加表情
				parts.push({
					type: 'emoji',
					index: parseInt(match[1])
				});
				lastIndex = match.index + match[0].length;
			}
			
			// 添加剩余文本
			if (lastIndex < content.length) {
				parts.push({
					type: 'text',
					content: content.substring(lastIndex)
				});
			}
			
			return parts.length > 0 ? parts : [{ type: 'text', content }];
		},
		
		// 检查角色是否可以被删除
		canDeleteRole(index) {
			// 禁止删除索引0（"我"）
			if (index === 0) {
				return false;
			}
			// 检查是否有历史消息使用该角色
			const hasMessages = this.massageList.some(msg => msg.location === index);
			return !hasMessages;
		},
			
			// 生成缓存键名
			getCacheKey() {
				const identifier = this.guestInfo.nickname || 'default';
				return `chatGrop_${identifier}`;
			},
			
			// 保存聊天数据到本地
			saveChatData() {
				try {
					const cacheKey = this.getCacheKey();
					const chatData = {
						massageList: this.massageList,
						guestList: this.guestList,
						currentRoleIndex: this.currentRoleIndex, // 重命名
						lastUpdate: new Date().getTime()
					};
					uni.setStorageSync(cacheKey, JSON.stringify(chatData));
					console.log('聊天数据已保存');
				} catch (e) {
					console.error('保存聊天数据失败:', e);
				}
			},
			
			// 从本地恢复聊天数据
			loadChatData() {
				try {
					const cacheKey = this.getCacheKey();
					const cachedData = uni.getStorageSync(cacheKey);
					
					if (cachedData) {
						const chatData = JSON.parse(cachedData);
						this.massageList = chatData.massageList || [];
						
						// 恢复角色列表，确保"我"在索引0
						if (chatData.guestList && chatData.guestList.length > 0) {
							this.guestList = chatData.guestList;
							// 确保第一个是"我"
							if (!this.guestList[0].isMe) {
								// 查找"我"或创建
								const meIndex = this.guestList.findIndex(r => r.isMe || r.id === 'role_me');
								if (meIndex > 0) {
									// 将"我"移到索引0
									const me = this.guestList.splice(meIndex, 1)[0];
									this.guestList.unshift(me);
								}
							}
						} else {
							this.guestList = [];
						}
						
						// 恢复当前角色索引，确保有效（兼容旧数据）
						if (chatData.currentRoleIndex !== undefined) {
							this.currentRoleIndex = Math.max(0, Math.min(chatData.currentRoleIndex, this.guestList.length - 1));
						} else if (chatData.isMe !== undefined) {
							// 兼容旧数据格式
							this.currentRoleIndex = chatData.isMe;
						} else {
							this.currentRoleIndex = 0;
						}
						
						console.log('聊天数据已恢复');
					} else {
						console.log('没有缓存数据，使用默认值');
					}
				} catch (e) {
					console.error('恢复聊天数据失败:', e);
				}
			},
			
			// 清空缓存（可选，用于调试或重置）
			clearChatCache() {
				try {
					const cacheKey = this.getCacheKey();
					uni.removeStorageSync(cacheKey);
					console.log('聊天缓存已清空');
				} catch (e) {
					console.error('清空缓存失败:', e);
				}
			},
			
			openMenu(){
				
			},
			checkSelect(index){
			if(this.currentActionIndex != -1 && this.currentActionIndex < this.massageList.length ){
				 return	index == this.massageList[this.currentActionIndex].location
			}else{
				return false
			}
			
			},
			getEmojiUrl(index, location = 1) {
				return location != 0 ? `/static/emoji/emoji_${index}.png` : `/static/emoji/emoji_${index}_blue.png`;
			},
		toggleRole() {
			this.currentActionIndex = this.activeMsgIndex;
			this.popupMenuPosition.show = false;
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
			changeRule(roleData) {
				// 支持对象或索引
				const index = typeof roleData === 'object' ? roleData.index : roleData;
				
				// 边界检查
				if (index < 0 || index >= this.guestList.length) {
					console.warn('切换角色失败：索引超出范围', index);
					return;
				}
				
				this.currentRoleIndex = index;
				console.log('切换到角色:', this.guestList[index].text);
			},
			changeMsgRule(i){
				// 边界检查
				if (i < 0 || i >= this.guestList.length) {
					console.warn('修改消息角色失败：索引超出范围', i);
					return;
				}
				
				if (this.currentActionIndex >= 0 && this.currentActionIndex < this.massageList.length) {
					this.massageList[this.currentActionIndex].location = i;
					this.currentActionIndex = -1;
				}
			},
			addGusetInfo(data) {
				// 生成唯一ID
				const newId = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
				
				this.guestList.push({
					id: newId,
					url: data.avatar || '/static/default-avatar.png',
					text: data.nickname || '未命名角色',
					desc: data.description || '',
					isMe: false // 明确标识不是"我"
				});
				
				console.log('添加角色成功:', data.nickname);
			},
			addGuset() {
				this.$refs.wxChatAdd.open();
			},
			
			// 处理编辑角色（从 FeaturePanel 组件触发）
			handleEditRole(roleData) {
				const role = this.guestList[roleData.index];
				if (!role) {
					console.warn('角色不存在:', roleData.index);
					return;
				}
				
				this.editingRoleIndex = roleData.index;
				this.editRoleInfo = {
					nickname: role.text || '',
					avatar: role.url || '',
					description: role.desc || ''
				};
				
				this.$refs.editRolePopup.open();
			},
			
			// 提交编辑角色
			onEditRoleSubmit(data) {
				if (this.editingRoleIndex === null || this.editingRoleIndex < 0) {
					console.warn('编辑角色索引无效');
					return;
				}
				
				const role = this.guestList[this.editingRoleIndex];
				if (!role) {
					console.warn('角色不存在');
					return;
				}
				
				// 更新角色信息
				role.text = data.nickname || role.text;
				role.url = data.avatar || role.url;
				role.desc = data.description || role.desc;
				
				// 如果是"我"（索引0），同时更新用户信息
				if (this.editingRoleIndex === 0 && this.userInfo) {
					// 从avatar URL中提取文件名（如果需要）
					if (data.avatar) {
						this.userInfo.avatar = data.avatar.replace('http://106.15.137.235:8080/upload/', '');
					}
				}
				
				this.updateMsg();
				
				uni.showToast({
					title: '编辑成功',
					icon: 'success'
				});
				
				this.editingRoleIndex = null;
				this.$refs.editRolePopup.close();
			},
			
			// 处理删除角色（从 FeaturePanel 组件触发）
			handleDeleteRole(roleData) {
				const index = roleData.index;
				
				// 再次检查（双重保护）
				if (index === 0) {
					uni.showToast({
						title: '不能删除"我"',
						icon: 'none'
					});
					return;
				}
				
				// 检查是否有历史消息使用该角色
				const hasMessages = this.massageList.some(msg => msg.location === index);
				if (hasMessages) {
					uni.showToast({
						title: '该角色有历史消息，无法删除',
						icon: 'none'
					});
					return;
				}
				
				// 删除角色
				this.guestList.splice(index, 1);
				
				// 如果删除的是当前选中的角色，切换到索引0
				if (this.currentRoleIndex === index) {
					this.currentRoleIndex = 0;
				} else if (this.currentRoleIndex > index) {
					// 如果删除的角色在当前选中角色之前，需要调整索引
					this.currentRoleIndex--;
				}
				
				this.updateMsg();
				
				uni.showToast({
					title: '删除成功',
					icon: 'success'
				});
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
				temp.location = this.currentRoleIndex;
				this.massageList.push(temp)
				// 删掉 i 位置的数据 在 i这里插入两条
			},
			addYuyin() {
				this.$refs.yuyinPopup.open();
			},
		closePopupMenu() {
			this.activeMsgIndex = -1;
			this.popupMenuPosition.show = false;
		},
		showPopupMenu(e, index) {
			this.activeMsgIndex = index;
			
			// 使用 nextTick 确保 DOM 已更新，然后查询消息元素位置
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this);
				// 查询消息元素的位置
				query.selectAll('.cell').boundingClientRect((rects) => {
					if (rects && rects[index]) {
						const rect = rects[index];
						const systemInfo = uni.getSystemInfoSync();
						
						// 计算菜单显示位置（显示在消息元素附近）
						// 菜单宽度自适应，最大不超过屏幕宽度减去边距
						const maxMenuWidth = systemInfo.windowWidth - 40;
						const estimatedMenuWidth = Math.min(720, maxMenuWidth); // 估算宽度，实际会根据内容自适应换行
						let left = rect.left + (rect.width / 2) - (estimatedMenuWidth / 2);
						let top = rect.top - 140 - 20; // 显示在消息上方，预留更多高度以容纳换行
						
						// 边界检查，确保菜单不超出屏幕
						if (left < 20) left = 20;
						if (left + estimatedMenuWidth > systemInfo.windowWidth - 20) {
							left = systemInfo.windowWidth - estimatedMenuWidth - 20;
						}
						if (top < 20) {
							top = rect.bottom + 20; // 如果上方空间不够，显示在下方
						}
						// 高度自适应，不需要严格限制，因为可以换行
						
						this.popupMenuPosition = {
							show: true,
							top: top,
							left: left
						};
					} else {
						// 如果无法获取元素位置，使用屏幕中央位置
						const systemInfo = uni.getSystemInfoSync();
						this.popupMenuPosition = {
							show: true,
							top: systemInfo.windowHeight / 3,
							left: 20
						};
					}
				}).exec();
			});
		},
		deleteMessage_1() {
			this.massageList.splice(this.activeMsgIndex, 1);
			this.activeMsgIndex = -1; // 清除激活状态
			this.popupMenuPosition.show = false;
			this.updateMsg();
		},
			onYuyinSubmit(data) {
				const location = this.currentRoleIndex;
				const transferInfo = {
					type: "content", // tips, content
					contentType: "yuyin", //order , chat ,link
					location, // 当前角色索引
					content: {
						time: parseInt(data.time)
					}
				};
				console.log(data);
				this.massageList.push(transferInfo);
			},
			onCradSubmitz(data) {

				const location = this.currentRoleIndex;
				const transferInfo = {
					type: "content", // tips, content
					contentType: "crad", //order , chat ,link
					location, // 当前角色索引
					content: data
				};
				console.log(data);
				this.massageList.push(transferInfo);
			},
		onPhotoSubmit(data) {
			console.log(data);
			const location = this.currentRoleIndex;
			const photoInfo = {
				type: "content", // tips, content
				contentType: "photo", //order , chat ,link
				location, // 当前角色索引
				content: data
			};
			console.log(photoInfo);
			
			// 如果有当前操作的索引，将图片插入到该消息上方
			if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
				this.massageList.splice(this.currentActionIndex, 0, photoInfo);
				// 插入后重置索引
				this.currentActionIndex = -1;
			} else {
				// 否则默认添加到末尾
				this.massageList.push(photoInfo);
			}
			
			this.updateMsg();
		},
		onTransferSubmit(data) {
			const location = this.currentRoleIndex;
			const transferInfo = {
				type: "content", // tips, content
				contentType: "transfer", //order , chat ,link
				location, // 当前角色索引
				content: {
					...data,
					tip: location === 0 ? "你发起了一笔转账" : "请收款"
				}
			};
			
			// 如果有当前操作的索引，将转账插入到该消息上方
			if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
				this.massageList.splice(this.currentActionIndex, 0, transferInfo);
				// 插入后重置索引
				this.currentActionIndex = -1;
			} else {
				// 否则默认添加到末尾
				this.massageList.push(transferInfo);
			}
			
			this.updateMsg();
		},
			async getUserInfo(userId) {
				console.log("执行用户信息获取", userId);
				const res = await getUserInfo(userId);
				console.log(res);
				this.userInfo = res.data;
				
				// 确保"我"在索引0位置
				const myRole = {
					id: 'role_me',
					url: 'http://106.15.137.235:8080/upload/' + res.data.avatar,
					text: '我',
					isMe: true
				};
				
				// 如果guestList为空或第一个不是"我"，则设置
				if (this.guestList.length === 0 || !this.guestList[0].isMe) {
					this.guestList.unshift(myRole);
				} else {
					// 更新"我"的信息
					this.guestList[0] = { ...this.guestList[0], ...myRole };
				}
				
				// 确保当前选中角色有效
				if (this.currentRoleIndex >= this.guestList.length) {
					this.currentRoleIndex = 0;
				}
			},
			onOrderSubmit(data) {
				const location = this.currentRoleIndex;
				console.log(data);
				const orderInfo = {
					type: "content", // tips, content
					contentType: "order", //order , chat ,link
					location, // 当前角色索引
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
		
		// 更新消息并保存
		updateMsg() {
			this.saveChatData();
		},
		
		// 打开编辑消息弹窗
		changeMsg() {
			if (this.activeMsgIndex === -1 || this.activeMsgIndex >= this.massageList.length) {
				uni.showToast({
					title: '请先选择要编辑的消息',
					icon: 'none'
				});
				return;
			}
			
			const message = this.massageList[this.activeMsgIndex];
			// 初始化编辑数据
			if (message.contentType === 'chat' || message.contentType === 'tips') {
				// 文本消息或提示消息，直接使用内容
				this.editMsgInfo = {
					content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
				};
			} else {
				// 其他类型消息，提示不支持编辑
				uni.showToast({
					title: '该类型消息不支持编辑',
					icon: 'none'
				});
				return;
			}
			
			this.currentActionIndex = this.activeMsgIndex;
			this.popupMenuPosition.show = false;
			this.$refs.editMsgPopup.open();
		},
		
		// 打开插入消息弹窗
		addMsg() {
			this.editMsgInfo = {
				content: ''
			};
			// 插入到当前选中消息的上方
			this.currentActionIndex = this.activeMsgIndex >= 0 ? this.activeMsgIndex : this.massageList.length;
			this.popupMenuPosition.show = false;
			this.$refs.msgPopup.open();
		},
		
		// 插入时间
		insertTime() {
			// 设置插入位置为当前选中消息的上方
			this.currentActionIndex = this.activeMsgIndex >= 0 ? this.activeMsgIndex : this.massageList.length;
			this.popupMenuPosition.show = false;
			// 打开时间弹窗
			this.$refs.timePopup.open();
		},
		
		// 插入红包
		insertRedBag() {
			// 设置插入位置为当前选中消息的上方
			this.currentActionIndex = this.activeMsgIndex >= 0 ? this.activeMsgIndex : this.massageList.length;
			this.popupMenuPosition.show = false;
			// 直接添加红包
			this.addRedBag();
		},
		
		// 插入转账
		insertTransfer() {
			// 设置插入位置为当前选中消息的上方
			this.currentActionIndex = this.activeMsgIndex >= 0 ? this.activeMsgIndex : this.massageList.length;
			this.popupMenuPosition.show = false;
			// 打开转账弹窗
			this.$refs.transferPopup.open();
		},
		
		// 插入图片
		insertPhoto() {
			// 设置插入位置为当前选中消息的上方
			this.currentActionIndex = this.activeMsgIndex >= 0 ? this.activeMsgIndex : this.massageList.length;
			this.popupMenuPosition.show = false;
			// 打开图片弹窗
			this.$refs.photoPopup.open();
		},
		
		// 提交编辑后的消息
		onEditMsgSubmit(data) {
			if (this.currentActionIndex === -1 || this.currentActionIndex >= this.massageList.length) {
				uni.showToast({
					title: '消息索引无效',
					icon: 'none'
				});
				return;
			}
			
			const message = this.massageList[this.currentActionIndex];
			
			// 更新本地消息内容
			this.massageList[this.currentActionIndex].content = data.content;
			
			this.currentActionIndex = -1;
			this.updateMsg();
			
			uni.showToast({
				title: '编辑成功',
				icon: 'success'
			});
		},
		
		// 提交插入的消息
		addMsgSubmit(data) {
			const location = this.currentRoleIndex;
			const msgInfo = {
				type: "content",
				contentType: "chat",
				location: location,
				content: data.content
			};
			

			// 插入到指定位置
			if (this.currentActionIndex >= 0 && this.currentActionIndex <= this.massageList.length) {
				this.massageList.splice(this.currentActionIndex, 0, msgInfo);
			} else {
				this.massageList.push(msgInfo);
			}
			
			this.currentActionIndex = -1;
			this.updateMsg();
		},

			onSwitchChange(e) {
				console.log(e);
				// 切换角色：在0和其他角色之间切换
				this.currentRoleIndex = this.currentRoleIndex === 0 ? (this.guestList.length > 1 ? 1 : 0) : 0;
				console.log("当前角色索引：", this.currentRoleIndex);
			},
		addRedBag() {
			const location = this.currentRoleIndex;

			const orderInfo = {
				type: "content", // tips, content
				contentType: "redBag", //order , chat ,link
				location, // 当前角色索引
				content: true
			};
			
			// 如果有当前操作的索引，将红包插入到该消息上方
			if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
				this.massageList.splice(this.currentActionIndex, 0, orderInfo);
				// 插入后重置索引
				this.currentActionIndex = -1;
			} else {
				// 否则默认添加到末尾
				this.massageList.push(orderInfo);
			}
			
			this.updateMsg();
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
					// case "transfer":
					// 	this.$refs.transferPopup.open();
					// 	break;
					case "photo":
						this.$refs.photoPopup.open();
						break;
					case "contact":
						this.$refs.cradPopup.open();
						break;
					// case "redBag":
					// 	this.addRedBag()
					// 	break
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
					const location = this.currentRoleIndex;
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
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 998;
		background-color: rgba(0, 0, 0, 0.3);
	}

	/* 悬浮菜单样式 */
	.floating-menu {
		position: fixed;
		z-index: 999;
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.floating-menu-content {
		background-color: white;
		border-radius: 32rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
		padding: 12rpx 16rpx;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-start;
		gap: 8rpx;
		backdrop-filter: blur(10rpx);
		max-width: calc(100vw - 40px);
	}

	.floating-menu-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 12rpx 16rpx;
		border-radius: 20rpx;
		transition: all 0.2s ease;
		min-width: 80rpx;
		cursor: pointer;
	}

	.floating-menu-item:active {
		background-color: #f5f5f5;
		transform: scale(0.95);
	}

	.floating-icon {
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		margin-bottom: 6rpx;
		transition: transform 0.2s ease;
	}

	.floating-menu-item:active .floating-icon {
		transform: scale(1.1);
	}

	.floating-text {
		font-size: 22rpx;
		color: #666;
		white-space: nowrap;
		line-height: 1.2;
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
		background-color: #ecedf1;
		color: black;
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
		width: 42rpx;
		/* height: 48rpx; */
		position: relative;
		/* top: 2upx; */
		margin-left: 16upx;
	}
.backimg-ios{
	width: 58upx;
}

	/* 顶部栏 - 固定在顶部 */



	.desc {
		color: #656a70;
		font-size: 24upx;
		/* margin-top: 2upx; */
	}

	.nikeName {
		
		font-size: 36upx;
		
	}
	.nikeName-ios{
		font-size: 36upx;
		font-weight: 500;
		color: #000;
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

	/* .nav-icon_more {
		width: 40rpx;
		height: 8rpx;
		margin-left: 20rpx;
	} */

	.nav-icon_phone {
		width: 54upx;
		/* height: 42upx; */
		position: relative;
		top: -4rpx;
	}
.nav-icon_more {
	width: 40upx;
	height: 40upx;
	margin-left: 10upx;
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
		margin-bottom: 30rpx;
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
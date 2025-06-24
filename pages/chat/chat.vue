<template>
	<view class="chat-page" :style="{ '--global-font-size': currentFontSize + 'px' }">
		<!-- 顶部栏 -->
		<view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack">
				<image class="backimg" src="../../static/qiw/black_leftIcon.png"></image>
			</view>
			<view class="title">
				<view class="nikeName"  :style="{ fontSize: rpx(36) }">
					{{guestInfo.name || "企业微信工坊"}}
				</view>
				<view class="desc" :style="{ fontSize: rpx(24) }">{{guestInfo.description}}</view>

			</view>
			<view class="icons">
				<image @click="addVideo" class="nav-icon_phone" src="/static/icon-phone.png"></image>
				<image @click="openMenu" class="nav-icon_more" src="/static/qiw/more.png"></image>
			</view>
		</view>

		<view class="chat-content">

			<view v-if="activeMsgIndex !== -1" class="overlay" @click="closePopupMenu"></view>

			<scroll-view class="chat-body" :scroll-top="scrollTop" :style="'background-image: url('+contentbg+');'"
				scroll-y :show-scrollbar="false">
				<view v-for="(item ,i ) in massageList " :key="i">

					<!-- 时间 -->
					<view @longpress="showPopupMenu($event, i)"  :style="{ fontSize: rpx(24) }" v-if="item.type == 'tips'" class="msg-time cell">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
							<view class="menu-item" @click="changeMsg(i)">
								<uni-icons type="chat" color="#999" size="25"></uni-icons>
								<text>时间编辑</text>
							</view>
						</view>
						{{item.content}}
					</view>
					<view class="orderBox cell" @longpress="showPopupMenu($event, i)"
						v-else-if="item.contentType == 'order'">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>

								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">

								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
						</view>
						<view class="msg right">
							<image class="avatar" mode="aspectFill"
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<ExternalPayCard :orderInfo="item.content" />
						</view>

					</view>
					<!-- 转账 -->
					<view v-else-if="item.contentType == 'transfer'" @longpress="showPopupMenu($event, i)" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
							<view class="menu-item" @click="resTransfer(i)">
								<uni-icons type="wallet" color="#999" size="25"></uni-icons>
								<text>收款</text>
							</view>
						</view>
						<view class="msg left" @longpress="showPopupMenu($event, i)" @click="goReceipt(item)"
							v-if="item.location == 0">
							<view class="avatar">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<TransferCard :class="!item.content.st?'tfCardLeft':'tfCardLeftBg'" :state="item.content.st"
								:name="item.content.name" :amount="item.content.amount"></TransferCard>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" @click="goReceipt(item)" v-else>
							<image class="avatar" mode="aspectFill"
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<TransferCard :class="!item.content.st?'tfCardRight':'tfCardRightBg'"
								:state="item.content.st" :name="item.content.name" :amount="item.content.amount">
							</TransferCard>

						</view>
					</view>
					<!-- 收款 -->
					<view v-else-if="item.contentType == 'wxtf'" @longpress="showPopupMenu($event, i)" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
						</view>
						<view class="msg left" @longpress="showPopupMenu($event, i)" @click="goCollection(item)"
							v-if="item.location == 0">
							<view class="avatar">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<ChTf class="tfCardLeftBg" :name="item.content.name" :amount="item.content.amount"></ChTf>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" @click="goCollection(item)"
							v-else>

							<image class="avatar" mode="aspectFill"
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<ChTf class="tfCardRightBg" :name="item.content.name" :amount="item.content.amount"></ChTf>
						</view>
					</view>
					<!-- 图片photo -->

					<view v-else-if="item.contentType == 'photo'" @longpress="showPopupMenu($event, i)" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
						</view>
						<view class="msg left" v-if="item.location == 0" @longpress="showPopupMenu($event, i)">
							<view class="avatar">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<image :src="item.content.avatar" class="phote leftp" mode="widthFix" />
						</view>

						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" mode="aspectFill"
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<image :src="item.content.avatar" class="phote rightp" mode="widthFix"></image>
						</view>
					</view>
					<view v-else-if="item.contentType == 'redBag'" @click="getRB(i)" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
						</view>
						<view class="msg left" @longpress="showPopupMenu($event, i)" v-if="item.location == 0">
							<view class="avatar">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<RedBag :class="item.content?'redbagLeft':'redbagLeftBg'" :location="item.location"
								:name="guestInfo.name  + (guestInfo.description||'')" :state="item.content"></RedBag>

						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>

							<image class="avatar" mode="aspectFill"
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<RedBag :class="item.content?'redbagRight':'redbagRightBg'" :location="item.location"
								:name="guestInfo.name + (guestInfo.description||'')" :state="item.content"></RedBag>

						</view>
					</view>
					<!-- 名片 -->
					<view v-else-if="item.contentType == 'crad'" @longpress="showPopupMenu($event, i)" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
						</view>

						<view class="msg left" @longpress="showPopupMenu($event, i)" v-if="item.location == 0">
							<view class="avatar">
								<image mode="widthFix" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<WxCard class="cardLeft" :nickname="item.content.nickname" :avatar="item.content.avatar">
							</WxCard>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" mode="widthFix"
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxCard class="cardRight" :nickname="item.content.nickname" :avatar="item.content.avatar">
							</WxCard>
						</view>
					</view>
					<!-- l、聊天 -->
					<view v-else-if="item.contentType == 'chat'" @longpress="showPopupMenu($event, i)" class="cell">

						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">

								<uni-icons type="close" color="#999" size="25"></uni-icons>

								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>

								<text>消息插入</text>
							</view>
							<view class="menu-item" @click="changeMsg(i)">
								<uni-icons type="chat" color="#999" size="25"></uni-icons>
								<text>消息编辑</text>
							</view>
						</view>
						<!-- 聊天内容 -->
						<view class="msg left" @longpress="showPopupMenu($event, i)" v-if="item.location == 0">
							<view class="avatar">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<view class="bubble" :style="{ fontSize: rpx(34) }" >
								<view>
									<template v-for="(part, i) in parseMessage(item.content)">
										<text v-if="part.type === 'text'" :key="i">{{ part.content }}</text>
										<image v-else-if="part.type === 'emoji'" :key="i"
											:src="getEmojiUrl(part.index,item.location)" class="emoji-inline" :style="{ width: rpx(40), height: rpx(40) }" />
									</template>
								</view>

							</view>
						</view>

						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>


							<image class="avatar" mode="aspectFill"
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view>
									<template v-for="(part, i) in parseMessage(item.content)">
										<text v-if="part.type === 'text'" :key="i">{{ part.content }}</text>
										<image v-else-if="part.type === 'emoji'" :key="i"
											:src="getEmojiUrl(part.index,item.location)" class="emoji-inline" :style="{ width: rpx(40), height: rpx(40) }" />
									</template>

								</view>
							</view>
						</view>


					</view>
					<!-- 视频电话 -->
					<view v-else-if="item.contentType == 'video'" @longpress="showPopupMenu($event, i)" class="cell">

						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">

								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>

								<text>消息插入</text>
							</view>
							<view class="menu-item" @click="changeMsg(i)">
								<uni-icons type="chat" color="#999" size="25"></uni-icons>
								<text>视频编辑</text>
							</view>
						</view>

						<view class="msg left" @longpress="showPopupMenu($event, i)" v-if="item.location == 0">
							<view class="avatar">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view class="videobox">
									
									<image src="/static/qiw/video.png" style="" mode="widthFix" :style="{ width: rpx(50),marginRight: rpx(12)}"></image>
									通话时长
									<text>{{item.content}}</text>
								</view>

							</view>
						</view>

						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>

							<image class="avatar" mode="aspectFill"
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble"  :style="{ fontSize: rpx(34) }">
								<view>
									<view class="videobox">
										通话时长
										<text>{{item.content}}</text>
									<image  style="margin-left: 16upx;" src="/static/qiw/video2.png"  mode="widthFix"  :style="{ width: rpx(50),marginLeft: rpx(12)}"></image>
									</view>

								</view>
							</view>
						</view>


					</view>
					<!-- <image src="/static/emoji/emoji_1_blue.png"></image> -->
				</view>

			</scroll-view>

			<!-- 底部输入栏 -->
			<view class="fun_box">
				<ChatToolBar />
				<view class="chat-input" :style="{marginBottom: keyboardHeight+'px'}">
					<image class="icon" :style="{ width: rpx(60), height: rpx(60) }"  src="/static/icon-voice.png" ></image>
					<view class="input—box" :style="{  height: rpx(80) }" ><textarea  class="input" :adjustPosition="false" v-model="inputValue" @confirm="onEnterKey"
							placeholder-class /></view>
					<image class="icon_face"  :style="{ width: rpx(60), height: rpx(60) }" v-if="inputValue.length == 0" src="/static/icon-face.png" @click="changeEmoji">
					</image>
					<image class="icon_plus"  :style="{ width: rpx(68), height: rpx(68) }"  src="/static/icon-plus.png" @click="togglePopupBox"></image>
					<button class="send" @click="onEnterKey" v-if="inputValue.length>0"> 发送 </button>
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
								<view>
									<switch :checked="isMe" @change="onSwitchChange" />{{isMe?"我":"客户"}}
									<view style="margin-top: 20upx;">角色切换</view>
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
				<EditableFormPopup ref="transferPopup" :value="transfer" :fieldLabels="transferKey"
					@submit="onTransferSubmit" />
				<!-- 名片 -->
				<ProfileEditPopup ref="cradPopup" @submit="onCradSubmitz"></ProfileEditPopup>
				<!-- <EditableFormPopup ref="cradPopup" :value="crad" :fieldLabels="cradKey" @submit="onCradSubmitz" /> -->
				<!-- 图片 -->
				<UploadImage ref="photoPopup" @submit="onPhotoSubmit"></UploadImage>
				<!-- 消息添加弹窗 -->
				<EditableFormPopup ref="msgPopup" :value="editMsgInfo" :fieldLabels="editMsgKey"
					@submit="addMsgSubmit" />
				<!-- 消息编辑弹窗 -->
				<EditableFormPopup ref="editMsgPopup" :value="editMsgInfo" :fieldLabels="editMsgKey"
					@submit="onEditMsgSubmit" />
				<!-- <EditableFormPopup ref="editMsgPopup" :value="editMsgInfo" :fieldLabels="editMsgKey"
					@submit="onEditMsgSubmit" /> -->
				<!-- 时间编辑 -->
				<EditableFormPopup ref="videoPopup" :value="timeInfo" :fieldLabels="timeKey" @submit="onVideoSubmit" />
				<!-- 背景修改 -->
				<UploadImage ref="bgPopup" @submit="onBgSubmit"></UploadImage>
			</view>
		</view>
		<uni-popup ref="menuPopup" background-color="#fff" >
			<view class="menu" :style="{ paddingTop: statusBarHeight + 'px' }">
				<button type="primary" plain="true" @click="openBgPopup">修改背景</button>
				<!-- 滑块组件 -->
				  <view class="fontChange">
					<view class="">
						字体调节
					</view>
					<slider
					  :value="scale"
					  :min="0.7"
					  :max="1.5"
					  :step="0.02"
					  @changing="onScaleChange"
					/>
				  </view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import ExternalPayCard from '../../components/ExternalPayCard/ExternalPayCard.vue'; // 路径根据你存放的位置调整
	import EditableFormPopup from '../../components/EditableFormPopup/EditableFormPopup.vue';
	import ChatToolBar from '../../components/ChatToolBar/ChatToolBar.vue'
	import TransferCardVue from '../../components/TransferCard/TransferCard.vue';
	import UploadImage from '../../components/UploadImage/UploadImage.vue';
	import WxCard from '../../components/WxCard/WxCard.vue';
	import ChTf from '../../components/ChTf/ChTf.vue';
	import scaleMixin from '@/mixins/scaleMixin.js'
	import { setScale } from '@/utils/scale.js'
	import {
		getUserInfo, login
	} from '@/api/index.js'
	import {
		uploadImage,
		updateConversation
	} from '@/api/conversations.js'
	export default {
		mixins: [scaleMixin],
		components: {
			ExternalPayCard,
			EditableFormPopup,
			ChatToolBar,
			TransferCardVue,
			WxCard,
			ChTf
		},
		onLoad(options) {

			if (options.guestInfo) {
				try {
					this.guestInfo = JSON.parse(decodeURIComponent(options.guestInfo));
					console.log(this.guestInfo);
					this.massageList = JSON.parse(this.guestInfo.content)
					if (this.massageList == null) {
						this.massageList = []
					}
				} catch (e) {
					console.error('guestInfo 参数解析失败', e);
					this.massageList = []
					this.updateMsg()
				}
			}
			// 获取账号信息
			const userId = uni.getStorageSync('userId')
			console.log(userId);
			this.getUserInfo(userId)
			this.isIos =  uni.getSystemInfoSync().platform === 'ios'
			if(!this.isIos){
				this.keyboardHeight = 10
			}
			uni.onKeyboardHeightChange(res => {
				if (res.height == 0) {
					// console.log();)
					this.keyboardHeight = this.isIos?0: 10;
				} else {
					this.emoji = false
					this.openPopup = false
					const safeAreaBottom = this.getSafeAreaInsetBottom();
					this.keyboardHeight = res.height - safeAreaBottom  ;
				}
			});
			this.$forceUpdate()
			
			
		},
		data() {
			return {
				isIos:false,
				currentFontSize: 16, // 默认字体大小
				scrollTop: 0,
				contentbg: "null",
				total: 108,
				emoji: false,
				currentActionIndex: -1, // 添加当前操作的消息索引
				activeMsgIndex: -1, // 当前激活的消息索引
				keyboardHeight: 0,
				userInfo: {},
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
					{
						name: 'redBag',
						label: '红包',
						icon: '/static/redBag.png'
					}

				],
				massageList: [

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
				msgInfo: {
					msg: ""
				},
				msgKey: {
					msg: "消息"
				},
				// 消息编辑相关数据
				editMsgIndex: -1, // 编辑的消息索引
				editMsgInfo: {
					msg: "11"
				},
				editMsgKey: {
					msg: "编辑消息"
				},
				transfer: {
					name: "",
					amount: ""
				},
				transferKey: {
					name: "用户名",
					amount: "转账金额"
				},
				crad: {
					name: "",
				},
				cradKey: {
					name: "用户名",
				},
				// 弹出菜单相关数据
				popupStyle: {},
				popupVisible: false,
				menuItems: [{
						name: 'delete',
						label: '删除',
						icon: '/static/icon-delete.png'
					},
					{
						name: 'insertTime',
						label: '插入时间',
						icon: '/static/icon-time.png'
					},
					{
						name: 'toggleRole',
						label: '切换角色',
						icon: '/static/icon-contacts.png'
					}
				],
				// 新增数据属性
				timePopupVisible: false,
				currentTime: ''
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
		mounted() {
			this.scrollToBottom()
		},
		methods: {
			 getSafeAreaInsetBottom() {
			   const systemInfo = uni.getSystemInfoSync();
			     
			     // iOS 设备且有安全区域信息
			     if (systemInfo.platform === 'ios' && systemInfo.safeArea) {
			       return systemInfo.screenHeight - systemInfo.safeArea.bottom;
			     }
			     
			     // Android 设备通常没有安全区域问题，返回 0
			     return 0;
			},
			onScaleChange(e) {
			  const scale = e.detail.value
			  // setScale(this.scale)
			  this.$store.commit('setScale', scale)
			},
			scrollToBottom() {
				// 确保DOM更新完成
				this.$nextTick(() => {
					// 使用定时器延迟执行，确保DOM完全渲染
				  setTimeout(() => {
					  uni.createSelectorQuery().select('.chat-body')
					  	.fields({
					  		size: true, // 获取元素尺寸
					  		scrollOffset: true // 获取滚动位置和内容尺寸
					  	}, res => {
					  		console.log('内容总高度:', res.scrollHeight);
					  		console.log('可视区域高度:', res.height);
					  		console.log('当前滚动位置:', res.scrollTop);
					  		this.scrollTop = res.scrollHeight
					  	})
					  	.exec();
				  },100)
				});
			},
			openBgPopup() {
				this.$refs.bgPopup.open()
				this.$refs.menuPopup.close()
			},
			openMenu() {
				this.$refs.menuPopup.open('top')
			},
			getRB(i) {

				this.massageList[i].content = !this.massageList[i].content
				this.updateMsg()
			},
			resTransfer(i) {
				if (this.massageList[i].content.st) return;
				const temp = JSON.parse(JSON.stringify(this.massageList[i]))
				this.massageList[i].content.st = true
				temp.contentType = 'wxtf'
				temp.location = this.isMe ? 0 : 1;
				this.massageList.push(temp)
				// 删掉 i 位置的数据 在 i这里插入两条
				this.updateMsg()
			},
			goReceipt(item) {
				// console.log(item);
				uni.navigateTo({
					url: "/pages/receipt/receipt?info=" + encodeURIComponent(JSON.stringify(item.content))
				})
			},
			goCollection(item) {
				console.log("---");
				uni.navigateTo({
					url: "/pages/collectionSuccess/collectionSuccess?info=" + encodeURIComponent(JSON.stringify(
						item.content))
				})
			},
			updateMsg() {
				this.guestInfo.content = JSON.stringify(this.massageList)
				
				updateConversation(this.guestInfo.conversationId, this.guestInfo)
			},
			deleteMessage_1(index) {
				console.log(index);
				this.massageList.splice(index, 1);
				this.activeMsgIndex = -1; // 清除激活状态
				this.popupVisible = false;
				this.updateMsg()
			},
			addMsg(index) {
				this.currentActionIndex = index;
				this.$refs.msgPopup.open()
				this.activeMsgIndex = -1; // 清除激活状态
			},
			addMsgSubmit(data) {
				console.log(data.msg);
				this.addMsgcomm(data.msg)
			},
			showPopupMenu(e, index) {
				// 获取触摸坐标，适配弹出菜单位置
				const touch = e.touches?.[0] || {};
				const clientX = touch.clientX || 0;
				const clientY = touch.clientY || 0;

				// 获取窗口宽度
				const windowWidth = uni.getSystemInfoSync().windowWidth;

				// 计算菜单位置，确保不超出屏幕
				let left = clientX - 150; // 调整偏移以适应更多菜单项
				if (left < 0) left = 10; // 防止超出左边界
				if (left + 300 > windowWidth) left = windowWidth - 310; // 防止超出右边界

				// 设置菜单样式
				this.popupStyle = {
					left: `${left}px`,
					top: `${clientY - 80}px`,
					opacity: 0,
					transform: 'scale(0.8)',
					transition: 'all 0.2s ease-out'
				};

				// 延迟设置可见性，以便动画效果生效
				this.activeMsgIndex = index;
				this.popupVisible = true;

				// 触发重绘后设置最终样式
				setTimeout(() => {
					this.popupStyle = {
						...this.popupStyle,
						opacity: 1,
						transform: 'scale(1)'
					};
				}, 10);
			},
			closePopupMenu() {
				// 添加关闭动画
				this.popupStyle = {
					...this.popupStyle,
					opacity: 0,
					transform: 'scale(0.8)',
					transition: 'all 0.2s ease-out'
				};

				// 延迟隐藏，让动画完成
				setTimeout(() => {
					this.activeMsgIndex = -1;
					this.popupVisible = false;
				}, 200);
			},
			async getUserInfo(userId) {
				console.log("执行用户信息获取", userId);
				const res = await getUserInfo(userId)
				console.log(res);
				this.userInfo = res.data

			},
			onVideoSubmit(data) {
				const location = this.isMe ? 1 : 0;
				const transferInfo = {
					type: "content", // tips, content
					contentType: "video", //order , chat ,link
					location, // 1 表示我方
					content: data.time
				}

				// console.log(data);
				this.massageList.push(transferInfo)
				this.updateMsg()
			},
			async addVideo() {
				this.$refs.videoPopup.open()

			},

			async onCradSubmitz(data) {
				console.log(data);
				const res = await uploadImage(data.avatar, this.guestInfo.userId)
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
			onBgSubmit(data) {
				this.contentbg = data.avatar
			},
			async onPhotoSubmit(data) {
				console.log(data.avatar);
				const res = await uploadImage(data.avatar, this.guestInfo.userId)

				const location = this.isMe ? 1 : 0;
				const photoInfo = {
					type: "content", // tips, content
					contentType: "photo", //order , chat ,link
					location, // 1 表示我方
					content: {
						avatar: res.data
					}
				};
				console.log(photoInfo);
				this.massageList.push(photoInfo);
				this.updateMsg()
			},
			onTransferSubmit(data) {
				const location = this.isMe ? 1 : 0;
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
				this.updateMsg()
			},
			async onCradSubmit(data) {
				console.log(data);
				const res = await uploadImage(data.avatar, this.guestInfo.userId)
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
			goBack() {
				uni.navigateBack();
			},
			changeEmoji() {
				this.openPopup = false
				this.emoji = !this.emoji
			},
			// 添加表情到输入框的方法
			addEmojiToInput(index) {
				// 构建表情标签，例如[smile]
				this.inputValue += `[emoji_${index}]`;
			},
			parseMessage(msg) {
				const result = [];
				const regex = /\[emoji_(\d+)\]/g;
				let lastIndex = 0;
				let match;

				while ((match = regex.exec(msg)) !== null) {
					if (match.index > lastIndex) {
						result.push({
							type: 'text',
							content: msg.substring(lastIndex, match.index)
						});
					}
					result.push({
						type: 'emoji',
						index: parseInt(match[1])
					});
					lastIndex = regex.lastIndex;
				}

				if (lastIndex < msg.length) {
					result.push({
						type: 'text',
						content: msg.substring(lastIndex)
					});
				}
				return result;
			},
			togglePopupBox() {
				this.openPopup = !this.openPopup;
				this.emoji = false
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
					case "redBag":
						this.addRedBag()
						break
					default:
						uni.showToast({
							title: '请联系管理员开通',
							icon: 'none'
						})
						break;
				}

			},
			addRedBag() {
				const location = this.isMe ? 1 : 0;

				const orderInfo = {
					type: "content", // tips, content
					contentType: "redBag", //order , chat ,link
					location, // 1 表示我方
					content: true
				};
				this.massageList.push(orderInfo);
				this.updateMsg()
			},
			onEnterKey() {
				console.log(this.inputValue);
				this.addMsgcomm(this.inputValue)
				this.inputValue = '';
				this.scrollToBottom()
			},
			addMsgcomm(inputValue) {
				if (inputValue.trim()) {
					console.log('用户输入内容:', inputValue);
					// 这里可以添加发送消息的逻辑
					const location = this.isMe ? 1 : 0
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

					this.updateMsg()
				}
			},
			// 新增时间插入功能
			insertTime(index) {
				this.currentActionIndex = index;
				this.$refs.timePopup.open()
				this.activeMsgIndex = -1;
				// 显示时间确认弹窗
				this.timePopupVisible = true;
			},

			// 取消插入时间
			cancelInsertTime() {
				this.timePopupVisible = false;
				this.activeMsgIndex = -1;
				this.popupVisible = false;
			},
			getEmojiUrl(index, location = 0) {
				return location == 0 ? `/static/emoji/emoji_${index}.png` : `/static/emoji/emoji_${index}_blue.png`;
			},
			// 新增角色切换功能
			toggleRole(index) {
				// 获取当前消息
				const currentMsg = this.massageList[index];

				// 切换消息角色（1变0，0变1）
				currentMsg.location = currentMsg.location === 1 ? 0 : 1;

				// 更新消息
				this.updateMsg();

				// 显示切换成功提示
				uni.showToast({
					title: currentMsg.location === 1 ? '已切换为自己' : '已切换为客户',
					icon: 'none'
				});

				// 关闭菜单
				this.activeMsgIndex = -1;
				this.popupVisible = false;
			},
			// 消息编辑功能
			changeMsg(index) {
				// 保存当前编辑的消息索引
				this.editMsgIndex = index;

				// 获取当前消息内容
				// this.editMsgInfo.msg =;
				this.editMsgInfo = {
					...this.editMsgInfo,
					msg: this.massageList[index].content
				}; // 更新数据
				// 打开编辑弹窗
				this.$refs.editMsgPopup.open();

				// 关闭弹出菜单
				this.activeMsgIndex = -1;
				this.popupVisible = false;
			},

			// 消息编辑提交
			onEditMsgSubmit(data) {
				if (this.editMsgIndex !== -1 && data.msg.trim()) {
					// 更新消息内容
					this.massageList[this.editMsgIndex].content = data.msg;

					// 更新消息
					this.updateMsg();

					// 显示成功提示
					uni.showToast({
						title: '消息编辑成功',
						icon: 'success'
					});
				}

				// 重置编辑索引
				this.editMsgIndex = -1;
			}
		}
	};
</script>

<style scoped>
	.fontChange{
		margin-top: 20upx;
		border:1px solid #007aff;
		padding: 10upx;
		border-radius: 16upx;
		
	}
	/* 字体调节 */
	.chat-page {
	    font-size: var(--global-font-size, 16px);
	}
	
	.menu{
		padding:40upx ;
	}
	.videobox {
		display: flex;
		/* text-align: center; */
		align-items: center;
		
	}
.videobox  image{
	position: relative;
	top: -2upx;
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

	.cardRight::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #fff;
	}

	.cardLeft::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #fff;
	}

	.redbagLeftBg,
	.redbagLeft,
	.tfCardLeftBg,
	.tfCardLeft,
	.cardLeft {
		margin-left: 14upx;
	}

	.tfCardLeftBg::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #fce1c3
	}

	.tfCardLeft::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #f99d3b;
	}

	.redbagLeftBg::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #f69e94
	}

	.redbagLeft::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #ff624f;
	}

	.tfCardRightBg::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #fce1c3;
	}

	.tfCardRight::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #f99d3b;
	}


	.redbagRightBg::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #f69e94;
	}

	.redbagRight::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #ff624f;
	}

	.redbagRight,
	.redbagRightBg,
	.tfCardRightBg,
	.tfCardRight,
	.cardRight {
		margin-right: 14upx;
	}


	.send {
		background-color: blue;
		color: #fff;
		height: 60upx;
		line-height: 60upx;
		font-size: 30upx;
		text-align: center;
	}

	.cell {
		position: relative;
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
		background-color: rgba(0, 0, 0, 0.05);
	}

	/* 美化后的弹出菜单 */
	.popup-menu {
		position: fixed;
		background-color: rgba(0, 0, 0, 0.85);
		color: white;
		border-radius: 12upx;
		padding: 15upx 20upx;
		z-index: 999;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		overflow: hidden;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(8px);
		transform-origin: center;
		max-width: 600upx;
	}

	.menu-item {
		padding: 15upx 25upx;
		font-size: 28upx;
		display: flex;
		flex-direction: column;
		align-items: center;
		white-space: nowrap;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 10upx;
		min-width: 80upx;
	}

	.menu-item:hover {
		background-color: rgba(255, 255, 255, 0.1);
		transform: translateY(-2upx);
	}

	.menu-item:active {
		transform: scale(0.95);
	}

	.menu-item image {
		width: 40upx;
		height: 40upx;
		margin-bottom: 10upx;
	}

	.menu-item text {
		font-size: 24upx;
	}

	.chat-page {
		display: flex;
		flex-direction: column;
		/* height: calc(100vh - 514upx); */
		height: 100vh;
		background-color: #eaeaea;
		overflow: hidden;

	}

	.chat-body ::-webkit-scrollbar {
		display: none;
	}

	.chat-content {
		display: flex;
		flex-direction: column;

		height: 100%;
		overflow: hidden;
	}

	.backimg {
		width: 48upx;
		height: 48upx;
		position: relative;
		/* top: 2upx; */
		margin-left: 16upx;
	}

	/* 顶部栏 */
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
		/* background: red; */
		/* text-align: left; */
		justify-content: center;
	}

	.desc {
		color: #e4eef0;
		font-size: 24upx;
		margin-top: 4upx;
	}

	.nikeName {
		font-size: 36upx;
		/* font-weight: 600; */
	}

	.back {
		font-size: 32upx;
		margin-right: 32upx;
	}

	.icons {
		display: flex;
		gap: 20upx;
		align-items: center;
	}

	.nav-icon_more {
		width: 40upx;
		height: 40upx;
		margin-left: 30upx;
	}

	.nav-icon_phone {
		width: 42upx;
		height: 42upx;
	}

	/* 聊天内容 */
	.chat-body {
		flex: 1;
		padding: 0 20upx;
		/* 修正 padding 属性 */
		box-sizing: border-box;
		/* max-height: calc(100vh - 80upx - 100upx); */
		
		overflow-y: auto;

		background-size: 100% 100%;

	}

	.msg-time {
		text-align: center;
		color: #999;
		font-size: 24upx;
		margin: 30upx 0;
	}

	.msg {
		display: flex;
		margin-top: 14upx;
		padding-bottom: 14upx;
	}

	.msg.left {
		flex-direction: row;
	}

	.msg.right {
		flex-direction: row-reverse;
	}

	.avatar {
		width: 80upx;
		height: 80upx;
		border-radius: 10upx;
		margin: 0 10upx;
		overflow: hidden;
	}

	.avatar image {
		width: 100%;
		height: 100%;
	}

	.bubble {
		max-width: 480upx;
		padding: 20upx 20upx;
		font-size: 34upx;
		border-radius: 16upx;
		background-color: #ffffff;
		line-height: 1.3;
		position: relative;
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}

	.msg.right .bubble {
		background-color: #CDE5FD;
		margin-right: 14upx;
	}

	.msg.left .bubble {
		margin-left: 14upx;
	}

	.msg.right .bubble::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #CDE5FD;
	}

	.msg.left .bubble::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid white;
	}

	/* 链接样式 */
	.link {
		color: #3086ff;
		margin-top: 10upx;
		display: inline-block;
	}

	.fun_box {

		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		/* 防止收缩 */
		/* max-height: calc(100vh - 80upx); */
	     padding-bottom: env(safe-area-inset-bottom); /* 防止内容被挡，但背景照样铺到底 */
		/* 减去 nav-bar 的高度 */
		background-color: #f5f5f5;
	}

	/* 输入框 */
	.chat-input {
		/* height: 120upx; */
		/* padding: 20upx; */
		background-color: #f5f5f5;
		display: flex;
		align-items: center;
		margin-top: 14upx;
		padding: 10upx 20upx;
		gap: 20upx;
		box-sizing: border-box;
	}

	.input {
		width: 100%;
		border-radius: 35upx;
		height: 100%;
		padding-top: 24upx;
		font-size: 28upx;
	}

	.input—box {
		flex: 1;
		height: 80upx;
		background-color: white;
		padding: 0 10upx;
		margin-left: -16upx;
		overflow: hidden;
		border-radius: 10upx;
	}

	.icon {
		width: 60upx;
		height: 60upx;
		margin-right: 10upx;
	}

	.icon_face {
		width: 60upx;
		height: 60upx;
		/* margin-left: 10upx; */
	}

	.icon_plus {
		width: 68upx;
		height: 68upx;
		/* margin-left: 10upx; */
	}

	.phote {
		width: 200upx;
		height: 200upx;
		object-fit: cover;
		/* margin-left: 10upx; */
		/* border-radius: 16upx; */
		/* background-color: #3086ff; */
	}

	.rightp {
		margin-right: 14upx;
	}

	.leftp {
		margin-left: 14upx;
	}

	.drawer {
		background-color: #fff;

		border-top-left-radius: 20upx;
		border-top-right-radius: 20upx;
		display: flex;
		justify-content: space-around;
		transition: height 0.3s ease;
		/* 添加过渡效果 */
	}

	.drawer-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20upx;
	}

	.drawer-icon {
		width: 80upx;
		height: 80upx;
		margin-bottom: 10upx;
	}

	.popup_box {
		background-color: #f9f9f9;
		padding: 20upx 0;
		border-top-left-radius: 20upx;
		border-top-right-radius: 20upx;
		transition: all 0.3s ease-in-out;
	}

	.drawer-swiper {
		height: 360upx;
	}

	.feature-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		padding: 0 20upx;
	}

	.feature-item {
		width: 25%;
		margin-top: 20upx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.feature-icon {
		width: 80upx;
		height: 80upx;
		margin-bottom: 10upx;
	}

	.feature-text {
		font-size: 24upx;
		color: #333;
	}
</style>